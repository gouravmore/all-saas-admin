import React from "react";
import {
  Box,
  Button,
  Divider,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface TenantConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
  submittedBy: string;
  submittedOn: string;
  isLoading?: boolean;
}

const TenantConfirmationModal: React.FC<TenantConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  tenantName,
  submittedBy,
  submittedOn,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    bgcolor: "#fff",
    boxShadow: 24,
    borderRadius: "8px",
    outline: "none",
  };

  const titleStyle = {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  const contentStyle = {
    padding: theme.spacing(2),
  };

  const footerStyle = {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  };

  const detailRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    "&:last-child": {
      marginBottom: 0,
    },
  };

  const labelStyle = {
    fontWeight: 600,
    color: theme.palette.text.primary,
  };

  const valueStyle = {
    color: theme.palette.text.secondary,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="tenant-confirmation-modal-title"
      aria-describedby="tenant-confirmation-modal-description"
    >
      <Box sx={modalStyle}>
        <Box sx={titleStyle}>
          <Typography
            variant="h6"
            component="h2"
            id="tenant-confirmation-modal-title"
            sx={{ fontWeight: 600 }}
          >
            {t("TENANT.CONFIRM_TENANT_CREATION")}
          </Typography>
        </Box>

        <Box sx={contentStyle} id="tenant-confirmation-modal-description">
          <Typography variant="body2" sx={{ marginBottom: theme.spacing(2) }}>
            {t("TENANT.CONFIRMATION_MESSAGE")}
          </Typography>

          <Box sx={detailRowStyle}>
            <Typography variant="body2" sx={labelStyle}>
              {t("TENANT.TENANT_NAME")}:
            </Typography>
            <Typography variant="body2" sx={valueStyle}>
              {tenantName}
            </Typography>
          </Box>

          <Box sx={detailRowStyle}>
            <Typography variant="body2" sx={labelStyle}>
              {t("TENANT.SUBMITTED_BY")}:
            </Typography>
            <Typography variant="body2" sx={valueStyle}>
              {submittedBy}
            </Typography>
          </Box>

          <Box sx={detailRowStyle}>
            <Typography variant="body2" sx={labelStyle}>
              {t("TENANT.SUBMITTED_ON")}:
            </Typography>
            <Typography variant="body2" sx={valueStyle}>
              {submittedOn}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box sx={footerStyle}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              height: "40px",
              minWidth: "100px",
            }}
          >
            {t("COMMON.CANCEL")}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={isLoading}
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              height: "40px",
              minWidth: "120px",
              color: "white",
            }}
          >
            {isLoading ? t("COMMON.SENDING") : t("TENANT.SEND_REQUEST")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TenantConfirmationModal;
