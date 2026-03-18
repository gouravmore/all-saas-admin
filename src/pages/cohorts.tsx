import React, { useCallback, useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import PageSizeSelector from "@/components/PageSelector";
import {
  cohortCreate,
  deleteCohort,
  getCohortList,
  getTenantLists,
  rolesList,
  updateCohortUpdate,
  userCreate,
} from "@/services/CohortService/cohortService";
import { CohortTypes, Numbers, SORT, Status } from "@/utils/app.constant";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import Loader from "@/components/Loader";
import { customFields } from "@/components/GeneratedSchemas";
import { showToastMessage } from "@/components/Toastify";
import AddNewCenters from "@/components/AddNewTenant";
import { getCohortTableData } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import { mapFields, transformLabel } from "@/utils/Helper";
import SimpleModal from "@/components/SimpleModal";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import DynamicForm from "@/components/DynamicForm";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { useRouter } from "next/router";
import cohortSchema from "./cohortSchema.json";
import AddIcon from "@mui/icons-material/Add";
import userJsonSchema from "./userSchema.json";
import cohortASchema from "./cohortAdminSchema.json";
import updateCohortSchema from "./cohortUpdateSchema.json";
import { sendRequest } from "@/services/InvitationService";
import PasswordCreate from "../components/CreatePassword";
import { bulkUpload } from "@/services/UploadService";
import { tenantId } from "../../app.config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface UploadResult {
  registered: number;
  failed: number;
  alreadyRegistered: number;
  failedRecords?: Array<{
    record: string;
    reason: string;
  }>;
}
type cohortFilterDetails = {
  type?: string;
  status?: any;
  states?: string;
  districts?: string;
  blocks?: string;
  name?: string;
  activeMembers?: string;
  archivedMembers?: string;
};

interface Roles {
  code: string;
  roleId: string;
}

interface RoleList {
  result: Roles[];
}

const Center: React.FC = () => {
  // use hooks
  const router = useRouter();

  const { t } = useTranslation();

  // handle states
  const [cohortAdminSchema] = useState(cohortASchema);
  const [selectedTenant, setSelectedTenant] = React.useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [selectedFilter, setSelectedFilter] = useState("Active");
  const [cohortData, setCohortData] = useState<cohortFilterDetails[]>([]);
  const [cohertDashboardData, setCohertDashboardData] = useState<cohortFilterDetails[]>([]);

  const [pageSize, setPageSize] = React.useState<number>(10);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("");
  const [inputName, setInputName] = React.useState<string>("");
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [userId, setUserId] = useState("");
  const [adminRole, setAdminRole] = useState<boolean>();
  const [schema] = React.useState(cohortSchema);
  const [cohortUpdateSchema] = React.useState(updateCohortSchema);
  const [userSchema, setUserSchema] = React.useState(userJsonSchema);
  const [openAddNewCohort, setOpenAddNewCohort] =
    React.useState<boolean>(false);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageCount, setPageCount] = useState(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [pagination, setPagination] = useState(true);
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [formdata, setFormData] = useState<any>();
  const [totalCount, setTotalCound] = useState<number>(0);
  const [editFormData, setEditFormData] = useState<any>([]);
  const [listOfTenants, setListOfTenants] = useState<any>([]);
  const [isEditForm, setIsEditForm] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>("");
  const [Addmodalopen, setAddmodalopen] = React.useState(false);
  const [bulkUploadModalopen, setBulkUploadModalopen] = React.useState(false);
  const [updateBtnDisabled, setUpdateBtnDisabled] = React.useState(true);
  const [addFormData, setAddFormData] = useState({});
  const [addBtnDisabled, setAddBtnDisabled] = useState(true);
  const [roleList, setRolelist] = useState<RoleList | undefined>(undefined);
  const [error, setError] = useState<any>([]);
  const [isCreateCohortAdminModalOpen, setIsCreateCohortAdminModalOpen] =
    useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showSampleData, setShowSampleData] = useState(false);
  const [confirmButtonDisable, setConfirmButtonDisable] = useState<boolean>(true);

  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const createCenterStatus = useSubmittedButtonStore(
    (state: any) => state.createCenterStatus
  );

  const uiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter full name",
      "ui:options": {},
    },
    type: {
      "ui:widget": "text",
      // "ui:placeholder": "Select type",
      // "ui:options": {
      //   defaultValue: "cohort",
      // },
      "ui:disabled": true,
    },
    district: {
      "ui:widget": "text",
      "ui:placeholder": "Enter district",
      "ui:options": {},
    },
    status: {
      "ui:widget": "CustomRadioWidget",
      "ui:options": {
        defaultValue: "active",
      },
      // "ui:disabled": true,
    },
    block: {
      "ui:widget": "text",
      "ui:placeholder": "Enter block",
      "ui:options": {},
    },
  };

  const userUiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      // "ui:help": "Full name, numbers, letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
      // "ui:help": "Username must be at least 3 characters long.",
    },
    password: {
      "ui:widget": PasswordCreate,
      "ui:placeholder": "Enter a secure password",
    },
    role: {
      "ui:widget": "select",
      "ui:placeholder": "Select a role",
      // "ui:help": "Select a role.",
    },
    mobileNo: {
      "ui:widget": "text",
      "ui:placeholder": "Mobile number",
      "ui:help": "Enter a valid 10-digit mobile number.",
    },
    email: {
      // "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      "ui:help": "Enter a valid email address.",
      // "ui:options": {},
    },
    // dob: {
    //   "ui:widget": "date",
    //   "ui:placeholder": "Select your date of birth",
    //   // "ui:help": "Date of birth in YYYY-MM-DD format.",
    // },
  };
  const cohortAdminUiSchema = {
    // name: {
    //   "ui:widget": "text",
    //   "ui:placeholder": "Enter your full name",
    //   "ui:help": "Full name, numbers, letters and spaces are allowed.",
    // },
    // username: {
    //   "ui:widget": "text",
    //   "ui:placeholder": "Enter your username",
    //   "ui:help": "Username must be at least 3 characters long.",
    //   "ui:options": {
    //     autocomplete: false,
    //     value: "",
    //   },
    //   "ui:inputProps": {
    //     autocomplete: false,
    //     value: "",
    //   },
    // },
    // password: {
    //   "ui:widget": "password",
    //   "ui:placeholder": "Enter a secure password",
    //   "ui:help":
    //     "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.",
    //   "ui:options": {
    //     autocomplete: false,
    //   },
    //   "ui:inputProps": {
    //     autocomplete: false,
    //     name: "password",
    //   },
    // },
    // role: {
    //   "ui:widget": "select",
    //   "ui:placeholder": "Select a role",
    //   // "ui:help": "Select a role.",
    // },
    // mobileNo: {
    //   "ui:widget": "text",
    //   "ui:placeholder": "Mobile number",
    //   "ui:help": "Enter a valid 10-digit mobile number.",
    // },
    email: {
      // "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      // "ui:help": "Enter a valid email address.",
      // "ui:options": {
      //   errorsSchema: {
      //     required: "This field is required",
      //     pattern: "Enter a valid email address",
      //   },
      // },
      // "ui:options": {},
    },
    // dob: {
    //   "ui:widget": "date",
    //   "ui:placeholder": "Select your date of birth",
    //   // "ui:help": "Date of birth in YYYY-MM-DD format.",
    // },
  };

  const [filters, setFilters] = useState<cohortFilterDetails>({
    type: "cohort",
    // states: "",
    status: [statusValue],
    // districts: "",
  });
  const handleCloseAddLearnerModal = () => {
    setOpenAddNewCohort(false);
    setUpdateBtnDisabled(true);
  };
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const getAdminInformation = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin) {
        setFilters({
          type: "cohort",
          // states: "",
          status: filters.status,
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getRole = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      setAdminRole(
        getRole?.tenantData?.[0]?.roleName == "tenant admin"
          ? true
          : false || getRole?.isSuperAdmin
      );
      setUserId(getRole?.userId);
    }
    getAdminInformation();
  }, []);

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     const obj = {
  //       limit: "10",
  //       page: 1,
  //       filters: {
  //         tenantId: selectedRowData?.tenantId,
  //       },
  //     };
  //     const response = await rolesList(obj);

  //     if (response?.result) {
  //       const rolesOptions = response.result.map((role: any) => ({
  //         const: role.roleId,
  //         title: role.title,
  //       }));

  //       setUserSchema((prevSchema) => ({
  //         ...prevSchema,
  //         properties: {
  //           ...prevSchema.properties,
  //           role: {
  //             ...prevSchema.properties.role,
  //             oneOf: rolesOptions,
  //           },
  //         },
  //       }));
  //     }
  //   };

  //   fetchRoles();
  // }, [Addmodalopen]);
  // const calculateCohortExpiry = (dateString: string) => {
  //   const originalDate = new Date(dateString);
  //   const newDate = new Date(originalDate);
  //   newDate.setDate(originalDate.getDate() + 30);
  //   return newDate.toISOString().split("T")[0];
  // };

  const fetchUserList = async () => {
    setLoading(true);
    try {
      setCohortData([]);
      const limit = 200; // pagination limit; use onExportFetch with limit 0 for full export
      const offset = pageOffset * pageSize;
      const sort = sortBy;

      const data = {
        limit,
        offset: offset,
        sort: sort,
        filters: filters,
      };

      const cohortData = {
        limit: limit,
        offset: offset,
        sort: sort,
        filters: {
          "type": "cohort",
          "status": ""
      },
      };

      const resp = await getCohortList(data);
      const getChortData = await getCohortList(cohortData);

      setCohertDashboardData(getChortData?.results || []);

      if (resp) {
        const result = resp?.results;

        const resultData = result?.map((item: any) => {
          const matchingTenant = listOfTenants.find(
            (tenant: any) => tenant?.tenantId === item?.tenantId
          );

          return {
            name: item?.name,
            type: item?.type === "cohort" ? "Cohort" : item?.type,
            status: item?.status,
            tenantId: item?.tenantId,
            tenantName: matchingTenant?.name || "Unknown Tenant",
            updatedBy: item?.updatedBy,
            createdBy: item?.createdBy,
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt,
            cohortId: item?.cohortId,
            userRoleTenantMapping: { code: item?.role },
            tenantAdminEmail: item?.tenantAdminEmail || "-",
            cohortAdminEmail: item?.cohortAdminEmail || "-",
            createdByEmail: item?.createdByEmail || "-",
            updatedByEmail: item?.updatedByEmail || "-",
          };
        });

        setCohortData(resultData || []);
        const totalCount = resp?.count;
        setTotalCound(totalCount);
        setPagination(totalCount >= 5);
        setPageSizeArray(
          totalCount >= 15
            ? [5, 10, 15]
            : totalCount >= 10 && totalCount < 15
              ? [5, 10]
              : totalCount >= 5 && totalCount < 10
                ? [5]
                : []
        );
        const pageCount =
          totalCount > 0 ? Math.ceil(totalCount / pageLimit) : 1;
        setPageCount(pageCount);

        // if (pageOffset >= pageCount) {
        //   setPageOffset(pageCount - 1);
        // }
      } else {
        setCohortData([]);
      }
    } catch (error) {
      // console.error("Error fetching cohort list:", error);
      setCohortData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserList();
    };

    fetchData();
  }, [
    pageOffset,
    pageLimit,
    sortBy,
    filters,
    filters.states,
    filters.status,
    createCenterStatus,
    listOfTenants,
  ]);

  const onExportFetch = useCallback(async () => {
    const data = {
      limit: 0,
      offset: 0,
      sort: sortBy,
      filters,
    };
    const resp = await getCohortList(data);
    const result = resp?.results || [];
    return result.map((item: any) => {
      const matchingTenant = listOfTenants.find(
        (tenant: any) => tenant?.tenantId === item?.tenantId
      );
      return {
        name: item?.name,
        type: item?.type === "cohort" ? "Cohort" : item?.type,
        status: item?.status,
        tenantId: item?.tenantId,
        tenantName: matchingTenant?.name || "Unknown Tenant",
        updatedBy: item?.updatedBy,
        createdBy: item?.createdBy,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        cohortId: item?.cohortId,
        userRoleTenantMapping: { code: item?.role },
        tenantAdminEmail: item?.tenantAdminEmail || "-",
        cohortAdminEmail: item?.cohortAdminEmail || "-",
        createdByEmail: item?.createdByEmail || "-",
        updatedByEmail: item?.updatedByEmail || "-",
      };
    });
  }, [sortBy, filters, listOfTenants]);

  // handle functions
  const handleChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPageLimit(Number(event.target.value));
    setPageOffset(0);
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value >= 1 && value <= pageCount) {
      setPageOffset(value - 1);
    }
  };

  const PagesSelector = () => (
    <Box sx={{ display: { xs: "block" } }}>
      <Pagination
        // size="small"
        color="primary"
        count={pageCount}
        page={pageOffset + 1}
        onChange={handlePaginationChange}
        siblingCount={0}
        boundaryCount={1}
        disabled={pageCount === 0}
        sx={{ marginTop: "10px" }}
      />
    </Box>
  );

  const PageSizeSelectorFunction = () => (
    <Box mt={2}>
      <PageSizeSelector
        handleChange={handleChange}
        pageSize={pageSize}
        options={pageSizeArray}
      />
    </Box>
  );

  const handleTenantChange = (
    selectedNames: string[],
    selectedCodes: string[]
  ) => {
    if (selectedNames && selectedCodes) {
      const tenantId = selectedCodes.join(",");

      setSelectedTenant(selectedNames);

      setFilters((prevFilter) => ({
        ...prevFilter,
        tenantId: tenantId,
      }));
    } else {
    }
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
    setIsCreateCohortAdminModalOpen(false);
    setUpdateBtnDisabled(true);
  };

  const handleActionForDelete = async () => {
    if (selectedCohortId) {
      try {
        const tenantid = selectedRowData?.tenantId;
        const resp = await deleteCohort(selectedCohortId, tenantid);
        if (resp?.responseCode === 200) {
          showToastMessage(t("COHORTS.DELETE_SUCCESSFULLY"), "success");
          const cohort = cohortData?.find(
            (item: any) => item.cohortId == selectedCohortId
          );
          if (cohort) {
            cohort.status = Status.ARCHIVED;
          }
        } else {
          showToastMessage("Cohort Not Archived", "error");
        }
      } catch (error: any) {
        // Show the API error message from the service
        showToastMessage(error.message || "Failed to delete cohort", "error");
      }
      setSelectedCohortId("");
    } else {
      setSelectedCohortId("");
    }
    fetchUserList();
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    if (cohortData?.length > 0) {
      if (event.target.value === "Z-A") {
        setSortBy(["name", SORT.DESCENDING]);
      } else if (event.target.value === "A-Z") {
        setSortBy(["name", SORT.ASCENDING]);
      } else {
        setSortBy(["createdAt", SORT.ASCENDING]);
      }
    }
    setSelectedSort(event.target.value);
  };

  const handleSearch = (keyword: string) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);
    if (keyword?.length > 3) {
      if (cohortData?.length > 0) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          name: keyword,
        }));
      }
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        name: keyword,
      }));
    }
  };

  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);

    setSelectedFilter(newValue);
    setPageSize(Numbers.TEN);
    setPageLimit(Numbers.TEN);
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);

    if (newValue === Status.ACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
    } else if (newValue === Status.INACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.INACTIVE],
      }));
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else if (newValue === Status.ALL_LABEL) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: "",
      }));
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
  };

  const handleEdit = async (rowData: any) => {
    setLoading(true);
    // Handle edit action here
    if (rowData) {
      setSelectedRowData(rowData);
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      const cohortName = rowData?.name;
      setInputName(cohortName);

      let data = {
        filters: {
          cohortId: cohortId,
          type: "cohort",
        },
        limit: Numbers.TWENTY,
        offset: 0,
      };
      const resp = await getCohortList(data);

      setFormData({
        ...rowData,
        status: rowData?.status ? rowData?.status : "active",
      });
      // Use cohortUpdateSchema for edit form instead of schema
      setEditFormData(mapFields(cohortUpdateSchema, rowData));
      setLoading(false);
      setIsEditForm(true);
    }
    setLoading(false);
  };

  const handleDelete = (rowData: any) => {
    setLoading(true);

    const cohortName = rowData?.name;
    // SetDeletedRowData
    setInputName(cohortName);
    setConfirmationModalOpen(true);
    if (rowData) {
      setSelectedRowData(rowData);
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleAdd = (rowData: any) => {
    // const tenantId = rowData?.tenantId;
    // const currentTenantId = localStorage.getItem("tenantId");
    // setPreviousTenantId(currentTenantId);
    // if (tenantId) {
    //   localStorage.setItem("tenantId", tenantId);
    //   console.log("Modal opened, Tenant ID set:", tenantId);
    // }
    setSelectedRowData({ ...rowData });
    setLoading(true);
    setAddmodalopen(true);
    setLoading(false);
  };
  const handleBulkAddModal = () => {
    setBulkUploadModalopen(false);
    setFileSelected(false);
    setFileName("");
    setIsUploading(false);
    setUploadComplete(false);
    setUploadFailed(false);
    setUploadResult(null);
    setErrorMessage("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      setFileSelected(true);

      // reset states when new file is upload
      setUploadComplete(false);
      setUploadFailed(false);
      setUploadResult(null);
      setErrorMessage("");
    }
  };
  const handleUpload = async () => {
    if (!fileSelected || !selectedRowData) return;

    setIsUploading(true);
    setUploadComplete(false);
    setUploadFailed(false);

    try {
      const cohortAdminRole: any = roleList?.result.find(
        (item: any) => item.code === "learner"
      );
      console.log({ cohortAdminRole });

      const fileInput = document.getElementById(
        "csv-file-upload"
      ) as HTMLInputElement;
      const uploadFile = fileInput?.files?.[0];
      if (!uploadFile) throw new Error("No file selected");
      const formData = new FormData();
      formData.append("csvFile", uploadFile, uploadFile.name);
      formData.append("tenantId", selectedRowData?.tenantId);
      formData.append("cohortId", selectedRowData?.cohortId);
      formData.append("roleId", cohortAdminRole.roleId);

      const response = await bulkUpload(formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (response?.responseCode === 200) {
        const formattedResponse = {
          registered: response.result.success || 0,
          failed: response.result.failed || 0,
          alreadyRegistered: 0,
          failedRecords:
            response.result.failedDetails?.map((item: any) => ({
              record: item?.record,
              reason: item?.error,
            })) || [],
        };
        setUploadResult(formattedResponse);
        setUploadComplete(true);
      } else {
        setUploadComplete(false);
      }
      // Set the upload result
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadFailed(true);
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (rowData: any) => {
    setSelectedRowData({ ...rowData });
    setBulkUploadModalopen(true);
  };
  // add  extra buttons
  const extraActions: any = [
    { name: t("COMMON.ADD"), onClick: handleAdd, icon: AddIcon },
    { name: t("COMMON.EDIT"), onClick: handleEdit, icon: EditIcon },
    { name: t("COMMON.DELETE"), onClick: handleDelete, icon: DeleteIcon },
  ];

  const onCloseEditMOdel = () => {
    setUpdateBtnDisabled(true);
  };

  const onCloseEditForm = () => {
    setIsEditForm(false);
    setUpdateBtnDisabled(true);
  };

  const handleChangeForm = (event: IChangeEvent<any>) => {
    setUpdateBtnDisabled(false);
    setAddBtnDisabled(false);
  };
  const handleError = (error: any) => {
    setError(error);
  };
  const handleCohortAdminError = (errors: any) => {
    if (errors.length > 0) {
      if (!errors[0].formData?.email) {
        errors = [
          errors.find((error: any) => error.name === "required"),
        ].filter(Boolean);
      }
    }
    return errors;
  };
  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      if (!selectedCohortId) {
        showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
        return;
      }

      const getChangedFields = (newData: any, oldData: any) => {
        const changes: Record<string, any> = {};
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== oldData[key]) {
            changes[key] = newData[key];
          }
        });
        return changes;
      };

      const changedFields = getChangedFields(formData, editFormData);

      if (Object.keys(changedFields).length === 0) {
        showToastMessage(t("USER.NO_CHANGES_TO_UPDATE"), "info");
        setLoading(false);
        return;
      }

      const tenantid = selectedRowData?.tenantId;
      const resp = await updateCohortUpdate(
        selectedCohortId,
        changedFields,
        tenantid
      );
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("COHORTS.COHORT_UPDATED_SUCCESSFULLY"), "success");
      } else {
        showToastMessage(t("COHORTS.COHORT_UPDATED_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("COHORTS.COHORT_UPDATED_FAILED");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      onCloseEditMOdel();
      fetchUserList();
      setIsEditForm(false);
    }
  };

  const handleAddUserClick = () => {
    setOpenAddNewCohort(true);
  };

  const handleMemberClick = async (
    type: "active" | "archived",
    count: number,
    cohortId: string
  ) => {
    if (!count) {
      console.error("No members available for this cohort.");
      return;
    }

    try {
      let data = {
        limit: 0,
        offset: 0,
        filters: {
          cohortId: cohortId,
        },
      };

      const result = await getCohortList(data);

      if (!result || !result.results || !result.results.cohortDetails) {
        console.log("Invalid response structure or no cohort details found.");
      }

      const customFields = result?.results?.cohortDetails?.[0]?.customFields;

      // Check if customFields exist
      if (!customFields || customFields.length === 0) {
        console.log("No custom fields found for this cohort.");
      }

      const urlData: any = { type: type };

      customFields?.forEach((item: any) => {
        if (item?.label === "STATES") {
          urlData.stateCode = item?.code;
        } else if (item?.label === "DISTRICTS") {
          urlData.districtCode = item?.code;
        } else if (item?.label === "BLOCKS") {
          urlData.blockCode = item?.code;
        }
      });

      if (!urlData.stateCode || !urlData.districtCode || !urlData.blockCode) {
        throw new Error(
          "Incomplete location data (state, district, block) for the cohort."
        );
      }

      if (urlData) {
        //  localStorage.setItem("selectedBlock", selectedBlock[0])
        // router.push(
        //   `learners?state=${urlData.stateCode}&district=${urlData.districtCode}&block=${urlData.blockCode}&status=${urlData.type}`
        // );
      }
    } catch (error) {
      console.log("Error handling member click:", error);
    }
  };
  const handleAddmodal = () => {
    // if (previousTenantId) {
    //   localStorage.setItem("tenantId", previousTenantId);
    //   console.log("Modal closed, Tenant ID restored:", previousTenantId);
    // } else {
    //   localStorage.removeItem("tenantId");
    //   console.log("Modal closed, Tenant ID removed");
    // }
    setAddmodalopen(false);
    setAddBtnDisabled(true);
    setAddFormData({});
  };
  // const handleBulkAddModal = () => {
  //   setBulkUploadModalopen(false);
  // };

  const handleAddAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      setLoading(true);
      interface UserCreateData {
        name: string;
        username: string;
        password: any;
        mobile: string;
        email: string;
        grade: number;
        tenantCohortRoleMapping: Array<{
          roleId: string;
          tenantId: string;
          cohortId: string[];
        }>;
      }

      const matchedRole = roleList?.result?.find(
        (role: any) => role.code === formData?.role
      );
      const roleId = matchedRole ? matchedRole?.roleId : "";

      setConfirmButtonDisable(true);
      const formatName = (names: any) => {
        return names?.trim().replace(/\s+/g, " ");
      };

      let obj: UserCreateData = {
        name: formatName(formData?.name),
        mobile: formData?.mobileNo,
        email: formData?.email,
        username: formData?.username.replace(/\s/g, ""),
        password: formData?.password,
        grade: formData?.grade,
        tenantCohortRoleMapping: [
          {
            roleId: roleId,
            tenantId: selectedRowData?.tenantId,
            cohortId: [selectedRowData?.cohortId],
          },
        ]
      };

      const resp = await userCreate(obj as any, selectedRowData?.tenantId);

      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("USER.CREATE_SUCCESSFULLY"), "success");
        setLoading(false);
      } else {
        showToastMessage(t("USER.CREATE_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("USER.CREATE_FAILED");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      handleCloseModal();
      onCloseEditMOdel();
      setAddmodalopen(false);
      fetchUserList();
      setIsEditForm(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const result = await getTenantLists(filters);
      setListOfTenants(result);
    };

    fetchData();
  }, [filters]);

  const handleCreateCohortAdmin = (rowData: any) => {
    setSelectedRowData(rowData);
    setIsCreateCohortAdminModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const roleObj = {
        limit: "10",
        page: 1,
        filters: {
          tenantId: selectedRowData?.tenantId,
        },
      };

      const response = await rolesList(roleObj, selectedRowData?.tenantId);
      setRolelist(response);
    };
    fetchData();
  }, [isCreateCohortAdminModalOpen, bulkUploadModalopen, Addmodalopen]);
  const handleAddCohortAdminAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      setLoading(true);

      const cohortAdminRole = roleList?.result.find(
        (item: any) => item.code === "cohort_admin"
      );

      let obj = {
        invitedTo: formData?.email,
        tenantId: selectedRowData?.tenantId,
        cohortId: selectedRowData?.cohortId,
      };
      ///sent invitation
      const resp = await sendRequest(obj as any, selectedRowData?.tenantId);

      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(
          t("COHORTS.COHORT_ADMIN_CREATE_SUCCESSFULLY"),
          "success"
        );
        setLoading(false);
      } else {
        showToastMessage(t("COHORTS.COHORT_ADMIN_CREATE_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      handleCloseModal();
      onCloseEditMOdel();
      fetchUserList();
      setIsEditForm(false);
    }
  };
  const userProps = {
    tenants: listOfTenants,
    userType: t("COHORTS.COHORTS"),
    searchPlaceHolder: t("COHORTS.SEARCH_COHORT"),
    showTenantCohortDropDown: true,
    isTenantShow: true,
    selectedSort: selectedSort,
    selectedFilter: selectedFilter,
    statusArchived: false,
    statusInactive: true,
    selectedTenant: selectedTenant,
    handleTenantChange: handleTenantChange,
    handleSortChange: handleSortChange,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    showAddNew: false,
    handleAddUserClick: handleAddUserClick,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    showSort: false,
  };

  return (
    <>
      <ConfirmationModal
        message={
          selectedRowData?.totalActiveMembers > 0
            ? t("CENTERS.YOU_CANT_DELETE_CENTER_HAS_ACTIVE_LEARNERS", {
                activeMembers: `${selectedRowData?.totalActiveMembers}`,
              })
            : t("CENTERS.SURE_DELETE_CENTER") +
              inputName +
              " " +
              t("CENTERS.CENTER") +
              "?"
        }
        handleAction={handleActionForDelete}
        buttonNames={
          selectedRowData?.totalActiveMembers > 0
            ? { secondary: t("COMMON.CANCEL") }
            : { primary: t("COMMON.YES"), secondary: t("COMMON.CANCEL") }
        }
        handleCloseModal={handleCloseModal}
        modalOpen={confirmationModalOpen}
      />

      <HeaderComponent 
        {...userProps}
        showDashboard={true}  
        dashboardData={{
          total: cohertDashboardData?.length || 0,
          active: cohertDashboardData?.filter((item: any) => item.status === "active").length || 0,
          inactive: cohertDashboardData?.filter((item: any) => item.status === "inactive").length || 0,
          type: "Cohorts",
          totalIcon: "👩‍🏫"
        }}
      >
        {loading ? (
          <Box
            width={"100%"}
            id="check"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
          </Box>
        ) : cohortData?.length > 0 ? (
          <Box
            sx={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "15px",
            }}
          >
            <KaTableComponent
              columns={getCohortTableData(t, isMobile, adminRole, filters)}
              addAction={filters?.status?.[0] != "inactive" ? true : false}
              data={cohortData}
              limit={pageLimit}
              roleButton
              offset={pageOffset}
              addCohortBtnFunc={handleCreateCohortAdmin}
              paginationEnable={totalCount > Numbers.TEN}
              PagesSelector={PagesSelector}
              pagination={pagination}
              PageSizeSelector={PageSizeSelectorFunction}
              pageSizes={pageSizeArray}
              extraActions={extraActions}
              showIcons={true}
              allowEditIcon={true}
              showReports={false}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              handleMemberClick={handleMemberClick}
              handleBulkUpload={handleBulkUpload}
              showExport={true}
              exportFileName={
                filters?.status?.[0] && filters.status[0] !== "" && filters.status[0] !== Status.ALL_LABEL
                  ? `cohorts_${filters.status[0].toLowerCase()}`
                  : "cohorts"
              }
              hiddenExportColumns={[
                { key: "tenantAdminEmail", title: t("TABLE_TITLE.TENANT_ADMIN_EMAIL") },
                { key: "cohortAdminEmail", title: t("TABLE_TITLE.COHORT_ADMIN_EMAIL") },
                { key: "createdByEmail", title: t("TABLE_TITLE.CREATED_BY_EMAIL") },
                { key: "updatedByEmail", title: t("TABLE_TITLE.UPDATED_BY_EMAIL") }
              ]}
              onExportFetch={onExportFetch}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "40px",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No cohorts found
            </Typography>
          </Box>
        )}

        <AddNewCenters
          open={openAddNewCohort}
          onClose={handleCloseAddLearnerModal}
          formData={formdata}
          isEditModal={true}
          userId={userId}
        />

        <SimpleModal
          open={isEditForm}
          onClose={onCloseEditForm}
          showFooter={false}
          modalTitle={t("COHORTS.UPDATE_COHORT")}
        >
          {cohortUpdateSchema && uiSchema && (
            <DynamicForm
              schema={cohortUpdateSchema}
              uiSchema={uiSchema}
              onSubmit={handleUpdateAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={true}
              customFields={customFields}
              formData={editFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right", // Centers the button horizontally
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="submit"
                  form="update-center-form"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={onCloseEditForm}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  form="update-center-form"
                  disabled={updateBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.UPDATE")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>

        <SimpleModal
          open={Addmodalopen}
          onClose={handleAddmodal}
          showFooter={false}
          modalTitle={t("USER.ADD_NEW_USER")}
        >
          {userSchema && userUiSchema && (
            <DynamicForm
              schema={userSchema}
              uiSchema={userUiSchema}
              onSubmit={handleAddAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={false}
              customFields={customFields}
              formData={addFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right",
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="button"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={handleAddmodal}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={addBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.ADD")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>
        <SimpleModal
          open={bulkUploadModalopen}
          onClose={handleBulkAddModal}
          showFooter={false}
          modalTitle={t("COMMON.ADD_MULTIPLE_USERS")}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Main Upload Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
                Upload CSV File
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <input
                accept=".csv"
                style={{ display: "none" }}
                id="csv-file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
                
                {/* Enhanced Select CSV Button */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <label htmlFor="csv-file-upload">
                <Button
                      sx={{ 
                        color: "white",
                        minWidth: 200,
                        height: 50,
                        fontSize: "16px",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        textTransform: "none",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        background: fileSelected 
                          ? "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)" 
                          : "linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)",
                        "&:hover": {
                          background: fileSelected 
                            ? "linear-gradient(45deg, #388e3c 30%, #4caf50 90%)" 
                            : "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                          boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                          transform: "translateY(-2px)",
                        },
                        "&:active": {
                          transform: "translateY(0px)",
                        },
                        transition: "all 0.3s ease",
                        border: fileSelected ? "2px solid #4caf50" : "2px solid #2196f3",
                      }}
                  variant="contained"
                  component="span"
                      startIcon={<CloudUploadIcon sx={{ fontSize: "20px" }} />}
                  disabled={isUploading}
                >
                      {fileSelected ? "✓ CSV Selected" : "📁 Select CSV File"}
                </Button>
              </label>

                  {/* File info display */}
                  {fileSelected && (
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1,
                      padding: "8px 16px",
                      backgroundColor: "#e8f5e8",
                      borderRadius: "20px",
                      border: "1px solid #4caf50"
                    }}>
                      <CloudUploadIcon sx={{ color: "#4caf50", fontSize: "16px" }} />
                      <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: "500" }}>
                        {fileName}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {fileSelected &&
                !isUploading &&
                !uploadComplete &&
                !uploadFailed && (
                  <Button
                        sx={{ 
                          color: "white",
                          minWidth: 120,
                          height: 45,
                          fontSize: "14px",
                          fontWeight: "bold",
                          borderRadius: "6px",
                          textTransform: "none",
                          background: "linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #f57c00 30%, #ff9800 90%)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease",
                        }}
                    variant="contained"
                    onClick={handleUpload}
                    color="primary"
                  >
                        🚀 Upload Now
                  </Button>
                )}

              {isUploading && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                  startIcon={<CircularProgress size={20} color="inherit" />}
                      sx={{ 
                        minWidth: 140, 
                        height: 45,
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "6px"
                      }}
                    >
                      ⏳ Uploading...
                </Button>
              )}

              {uploadComplete && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  disabled
                      sx={{ 
                        minWidth: 160, 
                        height: 45,
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "6px"
                      }}
                    >
                      ✅ Upload Complete
                </Button>
              )}

              {uploadFailed && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ErrorIcon />}
                  disabled
                      sx={{ 
                        minWidth: 140, 
                        height: 45,
                        fontSize: "14px",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "6px"
                      }}
                    >
                      ❌ Upload Failed
                </Button>
              )}
                </Box>
              </Box>
            </Box>

            {/* Enhanced Sample CSV Reference - Collapsible */}
            <Box sx={{ 
              border: "1px solid #e3f2fd", 
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#fafafa",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderColor: "#2196f3"
              }
            }}>
              <Box 
                sx={{ 
                  background: showSampleData 
                    ? "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)" 
                    : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: showSampleData 
                      ? "linear-gradient(135deg, #bbdefb 0%, #e1bee7 100%)" 
                      : "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                    transform: "translateY(-1px)"
                  }
                }}
                onClick={() => setShowSampleData(!showSampleData)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: "50%", 
                    backgroundColor: showSampleData ? "#2196f3" : "#9e9e9e",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    transition: "all 0.3s ease"
                  }}>
                    <Typography sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}>
                      📋
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: "bold", 
                      color: showSampleData ? "#1976d2" : "#424242",
                      fontSize: "16px",
                      transition: "color 0.3s ease"
                    }}>
                      Sample CSV Format
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: showSampleData ? "#1976d2" : "#757575",
                      fontSize: "12px",
                      marginTop: "2px"
                    }}>
                      {showSampleData ? "Click to hide reference" : "Click to show format example"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  transition: "all 0.3s ease"
                }}>
                  <Typography variant="body2" sx={{ 
                    color: showSampleData ? "#1976d2" : "#757575",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    {showSampleData ? "Hide" : "Show"}
                  </Typography>
                  <Box sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: showSampleData ? "#2196f3" : "#9e9e9e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    transform: showSampleData ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    <Typography sx={{ color: "white", fontSize: "12px" }}>
                      ▼
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {showSampleData && (
                <Box sx={{ 
                  padding: "20px",
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid #e3f2fd"
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      color: "#1976d2", 
                      fontWeight: "bold", 
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}>
                      📊 Required CSV Structure
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", fontSize: "14px" }}>
                      Your CSV file must contain these exact column headers in the first row:
                    </Typography>
                  </Box>

                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      maxHeight: 250, 
                      mb: 3,
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "1px solid #e0e0e0"
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: "bold", 
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontSize: "14px",
                            textAlign: "center",
                            border: "1px solid #bbdefb"
                          }}>
                            name
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: "bold", 
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontSize: "14px",
                            textAlign: "center",
                            border: "1px solid #bbdefb"
                          }}>
                            username
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: "bold", 
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontSize: "14px",
                            textAlign: "center",
                            border: "1px solid #bbdefb"
                          }}>
                            password
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: "bold", 
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontSize: "14px",
                            textAlign: "center",
                            border: "1px solid #bbdefb"
                          }}>
                            grade
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa"
                          }}>
                            User_1
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa"
                          }}>
                            gourav_m1
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa"
                          }}>
                            Test@123
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa"
                          }}>
                            3
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0"
                          }}>
                            User_2
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0"
                          }}>
                            gourav_m2
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0"
                          }}>
                            Test@123
                          </TableCell>
                          <TableCell sx={{ 
                            textAlign: "center", 
                            fontSize: "13px",
                            border: "1px solid #e0e0e0"
                          }}>
                            2
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ 
                    backgroundColor: "#e8f5e8", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    border: "1px solid #c8e6c9"
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: "#2e7d32", 
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: "14px"
                    }}>
                      💡 <strong>Important:</strong> Please ensure your CSV file follows the above format with the required columns: name, username, password, and grade.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Upload Results */}
            {uploadComplete && uploadResult && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  backgroundColor: "#f8f9fa"
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upload Summary
                </Typography>
                <Typography color="success.main">
                  ✓ Successfully registered: {uploadResult.registered}
                </Typography>
                <Typography color="error.main">
                  ✗ Failed to register: {uploadResult.failed}
                </Typography>

                {uploadResult.failed > 0 && uploadResult.failedRecords && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Failed Records Details:
                    </Typography>
                    {uploadResult.failedRecords.map((record, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        color="error.main"
                      >
                        Username : {record?.record}- {record.reason}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {uploadFailed && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor: "#fff4f4",
                }}
              >
                <Typography color="error" variant="body1">
                  Upload failed: {errorMessage}
                </Typography>
              </Box>
            )}
          </Box>
        </SimpleModal>

        <SimpleModal
          open={isCreateCohortAdminModalOpen}
          onClose={handleCloseModal}
          showFooter={false}
          modalTitle={t("COHORTS.ADD_NEW_COHORT_ADMIN")}
        >
          {cohortAdminSchema && cohortAdminUiSchema && (
            <DynamicForm
              schema={cohortAdminSchema}
              uiSchema={cohortAdminUiSchema}
              onSubmit={handleAddCohortAdminAction}
              onChange={handleChangeForm}
              onError={handleCohortAdminError}
              widgets={{}}
              showErrorList={false}
              customFields={customFields}
              formData={addFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right",
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="button"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={handleCloseModal}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={addBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.SUBMIT")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>
      </HeaderComponent>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Center;

