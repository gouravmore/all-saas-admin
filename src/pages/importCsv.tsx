import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterSearchBar from "@/components/FilterSearchBar";
import { useRouter } from "next/router";
import cardData from "@/data/cardData";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AttachmentIcon from "@mui/icons-material/Attachment";
import FileUploadDialog from "@/components/FileUploadDialog";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { CoursePlannerMetaData } from "@/utils/Interfaces";
import { uploadCoursePlanner } from "@/services/coursePlanner";
import { showToastMessage } from "@/components/Toastify";

const ImportCsv = () => {
  const router = useRouter();
  const { subject } = router.query;
  const { t } = useTranslation();
  const [subjectDetails, setSubjectDetails] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      // Simulate data fetching
      setTimeout(() => {
        if (typeof subject === "string") {
          const card = cardData.find((card) => card.subjects.includes(subject));
          if (card) {
            setSubjectDetails({
              ...card,
              subject,
            });
          }
        }
        setLoading(false);
      }, 2000); // Simulated loading time
    };

    fetchData();
  }, [subject]);

  const handleBackClick = () => {
    router.back();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const metaData: CoursePlannerMetaData = {
        subject: "Gujarati",
        class: "10",
        state: "Punjab",
        board: "PSEB",
        type: "mainCourse",
        role: "Teacher",
        medium: "Hindi",
      };

      const result = await uploadCoursePlanner(selectedFile, metaData)
        .then((response) => {
          console.log(
            "Upload successful:",
            response.result.solutionData.message
          );

          if (
            response.result.solutionData.message ==
            "Solution created successfully"
          ) {
            showToastMessage(
              t("COURSE_PLANNER.COURSE_CREATED_SUCCESSFULLY"),
              "success"
            );
            setOpen(false);
          } else {
            showToastMessage(
              t("COURSE_PLANNER.COURSE_NOT_CREATED"),
              "success"
            );
          }
        })
        .catch((error) => {
          console.error("Upload failed:", error);
        });
    }
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(
      () => {
        alert("Link copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy link: ", err);
      }
    );
  };

  if (loading) {
    return <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />;
  }

  if (!subjectDetails) {
    return <Typography>{t("COURSE_PLANNER.CARD_NOT_FOUND")}</Typography>;
  }

  return (
    <Box sx={{ padding: isSmallScreen ? "16px" : "32px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: isSmallScreen ? "16px" : "0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isSmallScreen ? "h5" : "h4"}>
            {subjectDetails.subject}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
            onClick={handleClickOpen}
          >
            {t("COURSE_PLANNER.IMPORT_PLANNER")}
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderRadius: "8px",
              color: "#000000",
              borderColor: "#000000",
              "&:hover": {
                borderColor: "#333333",
                color: "#333333",
              },
            }}
            onClick={handleRemoveFile}
          >
            {t("COURSE_PLANNER.REMOVE_FILE")}
          </Button>
          <Button
            sx={{
              borderRadius: "8px",
              color: "#000000",
              borderColor: "#000000",
              "&:hover": {
                borderColor: "#333333",
                color: "#333333",
              },
            }}
            onClick={handleCopyLink}
          >
            <AttachmentIcon />
          </Button>
        </Box>
      </Box>

      <FilterSearchBar
        grade=""
        medium=""
        searchQuery=""
        handleGradeChange={() => {}}
        handleMediumChange={() => {}}
        handleSearchChange={() => {}}
        selectedOption=""
        handleDropdownChange={() => {}}
        card={undefined}
        selectFilter={undefined}
        onBackClick={() => {}}
        showGradeMedium={false}
        showFoundaitonCourse={false}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: isSmallScreen ? "50vh" : "calc(75vh - 200px)",
          padding: "16px",
        }}
      >
        <Typography
          variant={isSmallScreen ? "h4" : "h3"}
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#000000",
          }}
        >
          {t("COURSE_PLANNER.IMPORT_PLANNER_TO_UPLOADING")}
        </Typography>
      </Box>

      <FileUploadDialog
        open={open}
        onClose={handleClose}
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUpload}
      />
    </Box>
  );
};

export default ImportCsv;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
