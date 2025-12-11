import React, { ChangeEvent, useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import PageSizeSelector from "@/components/PageSelector";
import {
  cohortCreate,
  createUser,
  deleteTenant,
  roleCreate,
  rolesList,
  updateTenant,
} from "@/services/CohortService/cohortService";
import { CohortTypes, Numbers, Role, SORT, Status } from "@/utils/app.constant";

import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Box, Button, Typography, useMediaQuery, Card, CardContent, Grid } from "@mui/material";
import Loader from "@/components/Loader";
import { customFields } from "@/components/GeneratedSchemas";
import { showToastMessage } from "@/components/Toastify";
import AddNewTenant from "@/components/AddNewTenant";
import { getTenantTableData } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import { mapFields } from "@/utils/Helper";
import SimpleModal from "@/components/SimpleModal";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import DynamicForm from "@/components/DynamicForm";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import tenantSchema from "../components/TenantSchema.json";
import { getTenantLists } from "@/services/CohortService/cohortService";
import cohortSchemajson from "./cohortSchema.json";
import userJsonSchema from "./tenantAdminSchema.json";
import ProtectedRoute from "@/components/ProtectedRoute";
import PasswordCreate from "../components/CreatePassword";

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

interface TenantData {
  name: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  domain: string;
  tenantId: string;
  type: string;
  userRoleTenantMapping: string;
  tenantAdminEmail?: string;
}
interface RowData {
  cohortId: string;
  totalActiveMembers: number;
  [key: string]: any;
}

const Tenant: React.FC = () => {
  // use hooks
  const queryClient = useQueryClient();
  const router = useRouter();

  const { t } = useTranslation();
  const adminInformation = useSubmittedButtonStore(
    (state: any) => state.adminInformation
  );
  const state = adminInformation?.customFields?.find(
    (item: any) => item?.label === "STATES"
  );
  const getUserStateName = state ? state.value : null;
  const stateCode = state ? state?.code : null;
  // handle states
  const [selectedTenant, setSelectedTenant] = React.useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [selectedFilter, setSelectedFilter] = useState("Active");
  const [cohortData, setCohortData] = useState<cohortFilterDetails[]>([]);
  const [allTenantData, setAllTenantData] = useState<cohortFilterDetails[]>([]);
  const [dashboardTotalCount, setDashboardTotalCount] = useState<number>(0);
  const [dashboardActiveCount, setDashboardActiveCount] = useState<number>(0);
  const [dashboardInactiveCount, setDashboardInactiveCount] = useState<number>(0);
  const [pageSize, setPageSize] = React.useState<string | number>(10);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("");
  const [editModelOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [confirmButtonDisable, setConfirmButtonDisable] =
    React.useState<boolean>(false);
  const [inputName, setInputName] = React.useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [userId, setUserId] = useState("");
  const [schema] = React.useState(tenantSchema);
  const [cohortSchema] = React.useState(cohortSchemajson);
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
  const [editFormData, setEditFormData] = useState<any>([]);
  const [isEditForm, setIsEditForm] = useState(false);
  const [Addmodalopen, setAddmodalopen] = React.useState<any>(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isCreateTenantAdminModalOpen, setIsCreateTenantAdminModalOpen] =
    useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>("");
  const [adminRole, setAdminRole] = useState();
  const [updateBtnDisabled, setUpdateBtnDisabled] = React.useState(true);
  const [addBtnDisabled, setAddBtnDisabled] = React.useState(false);
  const [addFormData, setAddFormData] = useState({});
  const [tenantAdminSchema, setTenantAdminSchema] =
    React.useState(userJsonSchema);

  const uiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "",
    },
    status: {
      "ui:widget": "CustomRadioWidget",
      "ui:options": {
        defaultValue: "active",
      },
      "ui:disabled": true,
    },
  };
  const tenantAdminUiSchmea = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Full name, numbers, letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
      "ui:help": "Username must be at least 3 characters long.",
    },
    password: {
      "ui:widget": PasswordCreate,
      "ui:placeholder": "Enter a secure password",
      "ui:help":
        "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.",
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

  const cohortUiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter Cohort Name",
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
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
      "ui:help": "Username must be at least 3 characters long.",
    },
    password: {
      "ui:widget": "password",
      "ui:placeholder": "Enter a secure password",
      "ui:help":
        "Password must be at least 8 characters long, with at least one letter and one number.",
    },
    // role: {
    //   "ui:widget": "select",
    //   "ui:placeholder": "Select a role",
    //   // "ui:help": "Select a role.",
    // },
    status: {
      "ui:widget": "CustomRadioWidget",
      "ui:options": {
        defaultValue: "active",
      },
      "ui:disabled": true,
    },
  };

  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const [filters, setFilters] = useState<cohortFilterDetails>({
    type: CohortTypes.COHORT,
    states: "",
    status: [statusValue],
    districts: "",
  });

  const handleCloseAddLearnerModal = () => {
    setUpdateBtnDisabled(true);
    setOpenAddNewCohort(false);
  };
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const getAdminInformation = () => {
    if (typeof window !== "undefined" && window?.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin) {
        // const stateField: any = JSON.parse(admin).customFields.find(
        //   (field: any) => field.label === "STATES"
        // );
        // const object = [
        //   {
        //     value: stateField.code,
        //     label: stateField.value,
        //   },
        // ];

        // setStatesInformation(object);
        // setSelectedStateCode(object[0]?.value);

        setFilters({
          type: "COHORT",
          states: "",
          status: filters.status,
        });
      }
    }
  };

  // use api calls
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getRole = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      setAdminRole(getRole?.isSuperAdmin);
      setUserId(getRole?.userId);
    }

    // get form data for center create
    // getAddCenterFormData();
    // getCohortMemberlistData();
    getAdminInformation();
  }, []);

  const fetchTenantList = async () => {
    setLoading(true);
    try {
      setCohortData([]);
      const limit = pageLimit;
      const offset = pageOffset * limit;
      const sort = sortBy;
      let data = {
        filters: filters,
        limit: pageLimit,
        offset: pageOffset * limit,
        sort: sortBy,
      };

      const resp = await getTenantLists(data);
      if (resp && Array.isArray(resp)) {
        const resultData: TenantData[] = [];

        resp?.forEach((item: any) => {
          const requiredData: TenantData = {
            name: item.name || "-",
            status: item?.status ? item?.status : "Active",
            type: item?.type ? item?.type : "Cohort",
            updatedAt: item.updatedAt || "-",
            createdAt: item.createdAt || "-",
            domain: item.domain || "-",
            tenantId: item.tenantId || "-",
            userRoleTenantMapping: item.userRoleTenantMapping || "-",
            tenantAdminEmail: item.tenantAdminEmail || "-",
          };

          resultData.push(requiredData);
        });

        // Store all tenant data for filtering
        setAllTenantData(resultData);

        // Filter based on status and name search
        let filteredData = resultData;
        
        // Filter by status
        if (filters.status && filters.status.length > 0 && filters.status[0] !== "") {
          filteredData = filteredData.filter((item: any) => {
            const itemStatus = item.status?.toLowerCase();
            return filters.status.some((filterStatus: string) => 
              filterStatus.toLowerCase() === itemStatus
            );
          });
        }
        
        // Filter by name search
        if (filters.name && filters.name.trim() !== "") {
          const searchTerm = filters.name.toLowerCase().trim();
          filteredData = filteredData.filter((item: any) => {
            const itemName = (item.name || "").toLowerCase();
            return itemName.includes(searchTerm);
          });
        }

        setCohortData(filteredData);
        const totalCount = filteredData?.length;

        setPagination(totalCount >= 10);
        let pageSizeArrayCount: any = [];

        if (totalCount > 15) {
          pageSizeArrayCount = [5, 10, 15];
        } else if (totalCount >= 10) {
          pageSizeArrayCount = [5, 10];
        } else if (totalCount > 5) {
          pageSizeArrayCount = [5];
        }

        setPageSizeArray(pageSizeArrayCount);
        const pageCount = Math.ceil(totalCount / pageLimit);
        setPageCount(pageCount);
      } else {
        setCohortData([]);
        setAllTenantData([]);
        console.warn("API response is not an array:", resp);
      }

      setDataFetched(true);
      setLoading(false);
    } catch (error) {
      setCohortData([]);
      setAllTenantData([]);
      setDataFetched(true);
      setLoading(false);
      console.error("Error fetching tenant list:", error);
    }
  };

  // Fetch dashboard counts (total, active, inactive) - without status filter
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        let data = {
          filters: {
            ...filters,
            status: "", // No status filter for total count
          },
          limit: 0,
          offset: 0,
          sort: sortBy,
        };

        const resp = await getTenantLists(data);
        if (resp && Array.isArray(resp)) {
          const total = resp.length;
          setDashboardTotalCount(total);

          const active = resp.filter(
            (item: any) => item?.status?.toLowerCase() === Status.ACTIVE
          ).length;
          setDashboardActiveCount(active);

          const inactive = resp.filter(
            (item: any) => item?.status?.toLowerCase() === Status.INACTIVE
          ).length;
          setDashboardInactiveCount(inactive);
        }
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardCounts();
  }, [openAddNewCohort, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTenantList();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [openAddNewCohort, pageLimit, pageOffset, sortBy, filters]);

  // const getFormData = async () => {
  //   try {
  //     const res = await getFormRead("cohorts", "cohort");
  //     if (res && res?.fields) {
  //       const formDatas = res?.fields;
  //       setFormData(formDatas);
  //     } else {
  //       console.log("No response Data");
  //     }
  //   } catch (error) {
  //     showToastMessage(t("COMMON.ERROR_MESSAGE_SOMETHING_WRONG"), "error");
  //     console.log("Error fetching form data:", error);
  //   }
  // };

  // const getCohortMemberlistData = async (cohortId: string) => {
  //   const data = {
  //     limit: 0,
  //     offset: 0,
  //     filters: {
  //       cohortId: cohortId,
  //     },
  //   };
  //   const response = await fetchCohortMemberList(data);
  //   // const response = await queryClient.fetchQuery({
  //   //   queryKey: [
  //   //     QueryKeys.GET_COHORT_MEMBER_LIST,
  //   //     data.limit,
  //   //     data.offset,
  //   //     JSON.stringify(data.filters),
  //   //   ],
  //   //   queryFn: () => fetchCohortMemberList(data),
  //   // });

  //   if (response?.result) {
  //     const userDetails = response.result.userDetails;
  //     const getActiveMembers = userDetails?.filter(
  //       (member: any) =>
  //         member?.status === Status.ACTIVE && member?.role === Role.STUDENT
  //     );
  //     const totalActiveMembers = getActiveMembers?.length || 0;

  //     const getArchivedMembers = userDetails?.filter(
  //       (member: any) =>
  //         member?.status === Status.ARCHIVED && member?.role === Role.STUDENT
  //     );
  //     const totalArchivedMembers = getArchivedMembers?.length || 0;

  //     return {
  //       totalActiveMembers,
  //       totalArchivedMembers,
  //     };
  //   }

  //   return {
  //     totalActiveMembers: 0,
  //     totalArchivedMembers: 0,
  //   };
  // };

  // useEffect(() => {
  //   getFormData();
  // }, [
  //   pageOffset,
  //   pageLimit,
  //   sortBy,
  //   filters,
  //   filters.states,
  //   filters.status,
  //   createCenterStatus,
  // ]);

  // handle functions
  const handleChange = (event: SelectChangeEvent<typeof pageSize>) => {
    setPageSize(event.target.value);
    setPageLimit(Number(event.target.value));
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
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

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
    setUpdateBtnDisabled(true);
  };

  const handleActionForDelete = async (selectedRowData: RowData) => {
    if (selectedRowData) {
      let cohortDetails = {
        status: Status.ARCHIVED,
      };
      const resp = await deleteTenant(selectedRowData?.tenantId);
      if (resp?.responseCode === 200) {
        showToastMessage(t("TENANT.DELETE_SUCCESSFULLY"), "success");
        // const cohort = cohortData?.find(
        //   (item: any) => item.cohortId == selectedCohortId
        // );
        // if (cohort) {
        //   cohort.status = Status.ARCHIVED;
        // }
      } else {
        showToastMessage(t("Failed to Delete Tenant"), "error");
      }
      setSelectedCohortId("");
    } else {
      setSelectedCohortId("");
    }
    fetchTenantList();
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
    // Update filters with search keyword (search works for any length)
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: keyword || undefined,
    }));
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
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else if (newValue === Status.INACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.INACTIVE],
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
    // setIsEditModalOpen(true);
    if (rowData) {
      const cohortId = rowData?.tenantId;
      setSelectedCohortId(cohortId);
      const cohortName = rowData?.name;
      setInputName(cohortName);

      let data = {
        filters: {
          cohortId: cohortId,
        },
        limit: Numbers.TWENTY,
        offset: 0,
      };
      const resp = await getTenantLists(data);

      setEditFormData(mapFields(schema, rowData));
      setLoading(false);
      setIsEditForm(true);
    }
    setLoading(false);
    setConfirmButtonDisable(false);
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
    // localStorage.setItem("tenantId", rowData?.tenantId);
    setSelectedRowData({ ...rowData });
    setLoading(true);
    setAddmodalopen(true);
    setLoading(false);
  };

  // add  extra buttons
  const extraActions: any = [
    { name: t("COMMON.ADD"), onClick: handleAdd, icon: AddIcon },
    { name: t("COMMON.EDIT"), onClick: handleEdit, icon: EditIcon },
    { name: t("COMMON.DELETE"), onClick: handleDelete, icon: DeleteIcon },
  ];

  const onCloseEditMOdel = () => {
    setIsEditModalOpen(false);
    setUpdateBtnDisabled(true);
  };

  const onCloseEditForm = () => {
    setIsEditForm(false);
    setUpdateBtnDisabled(true);
  };
  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedName = event.target.value;
    setInputName(updatedName);
  };

  const handleChangeForm = (event: IChangeEvent<any>) => {
    setUpdateBtnDisabled(false);
    setAddBtnDisabled(false);
  };
  const handleError = () => {
    console.log("error");
  };

  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;
    try {
      setLoading(true);
      setConfirmButtonDisable(true);
      if (!selectedCohortId) {
        showToastMessage(t(""), "error");
        return;
      }
      const formatName = (names: any) => {
        return names?.trim().replace(/\s+/g, " ");
      };
      let cohortDetails = {
        name: formatName(formData?.name),
        domain: formData?.domain,
        // customFields: customFields,
      };
      const resp = await updateTenant(selectedCohortId, cohortDetails);
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("TENANT.UPDATE_SUCCESSFULLY"), "success");
        setLoading(false);
      } else {
        showToastMessage(t("TENANT.FAILED_TO_UPDATE"), "error");
      }
    } catch (error) {
      console.error("Error updating cohort:", error);
      showToastMessage(t("TENANT.FAILED_TO_UPDATE"), "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      fetchTenantList();
      setIsEditForm(false);
    }
  };
  const handleAddAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      setLoading(true);
      setConfirmButtonDisable(true);
      const formatName = (names: any) => {
        return names?.trim().replace(/\s+/g, " ");
      };
      let obj = {
        name: formatName(formData?.name),
        cohortId: selectedRowData?.cohortId,
        tenantId: selectedRowData?.tenantId,
        status: formData?.status,
        type: formData?.type,
      };
      const resp = await cohortCreate(obj, selectedRowData?.tenantId);

      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("COHORTS.CREATE_SUCCESSFULLY"), "success");
        setLoading(false);
      } else {
        showToastMessage(t("COHORTS.CREATE_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("COHORTS.CREATE_FAILED");
      showToastMessage(errorMessage, "error");
    } finally {
      // localStorage?.setItem("tenantId", "undefined");
      setLoading(false);
      setConfirmButtonDisable(false);
      handleCloseAddModal();
      onCloseEditMOdel();
      fetchTenantList();
      setIsEditForm(false);
    }
  };
  const handleAddTenantAdminAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      setLoading(true);
      setConfirmButtonDisable(true);

      const roleObj = {
        limit: "10",
        page: 1,
        filters: {
          tenantId: selectedRowData?.tenantId,
        },
      };
      const response = await rolesList(roleObj, selectedRowData?.tenantId);
      const tenantAdminRole = response?.result.find(
        (item: any) => item.code === "tenant_admin"
      );
      const formatName = (names: any) => {
        return names?.trim().replace(/\s+/g, " ");
      };

      let obj = {
        name: formatName(formData?.name),
        username: formData?.username.replace(/\s/g, ""),
        password: formData?.password,
        mobile: formData?.mobileNo,
        email: formData?.email,
        tenantCohortRoleMapping: [
          {
            roleId: tenantAdminRole.roleId,
            tenantId: selectedRowData?.tenantId,
          },
        ],
      };
      const resp = await createUser(obj);

      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("TENANT.TENANT_ADMIN_CREATE"), "success");
        setLoading(false);
      } else {
        showToastMessage(t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE"), "error");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      handleCloseAddModal();
      onCloseEditMOdel();
      fetchTenantList();
      setIsEditForm(false);
    }
  };
  const handleAddUserClick = () => {
    setOpenAddNewCohort(true);
  };

  const handleCloseAddModal = () => {
    setAddmodalopen(false);
    setIsCreateTenantAdminModalOpen(false);
    setAddFormData({});
  };

  // useEffect(() => {
  //   const fetchData = () => {
  //     try {
  //       const object = {
  //         // "limit": 20,
  //         // "offset": 0,
  //         fieldName: "states",
  //       };
  //       // const response = await getStateBlockDistrictList(object);
  //       // const result = response?.result?.values;
  //       if (typeof window !== "undefined" && window.localStorage) {
  //         const admin = localStorage.getItem("adminInfo");
  //         if (admin) {
  //           const stateField = JSON.parse(admin).customFields?.find(
  //             (field: any) => field?.label === "STATES"
  //           );
  //           if (!stateField?.value?.includes(",")) {
  //             // setSelectedState([stateField.value]);
  //             setSelectedStateCode(stateField?.code);
  //             if (
  //               selectedDistrictCode &&
  //               selectedDistrict.length !== 0 &&
  //               selectedDistrict[0] !== t("COMMON.ALL_DISTRICTS")
  //             ) {
  //               setFilters({
  //                 states: "",
  //                 districts: "",
  //                 status: filters.status,
  //                 type: CohortTypes.COHORT,
  //               });
  //             }
  //             if (
  //               selectedBlockCode &&
  //               selectedBlock.length !== 0 &&
  //               selectedBlock[0] !== t("COMMON.ALL_BLOCKS")
  //             ) {
  //               setFilters({
  //                 states: "",
  //                 districts: "",
  //                 blocks: "",
  //                 status: filters.status,
  //                 type: CohortTypes.COHORT,
  //               });
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchData();
  // }, [selectedBlockCode, selectedDistrictCode]);

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
      const result = await getTenantLists(filters);

      // const result = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.GET_COHORT_LIST,
      //     data.limit,
      //     data.offset,
      //     data.filters,
      //   ],
      //   queryFn: () => getCohortList(data),
      // });

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

  // Function to add or update a role for a given tenant in localStorage
  const saveOrUpdateRoleInLocalStorage = (
    tenantId: string,
    roleData: { roleId: string; title: string }
  ) => {
    // Retrieve existing roles array from localStorage or initialize an empty array
    const existingRoles: Array<{
      [key: string]: { title: string; roleId: string };
    }> = JSON.parse(localStorage.getItem("tenantRoles") || "[]");

    // Find if the tenantId already exists in the existing roles
    const tenantIndex = existingRoles.findIndex(
      (role) => Object.keys(role)[0] === tenantId
    );

    if (tenantIndex > -1) {
      // If tenantId exists, update the roleId and title for this tenant
      existingRoles[tenantIndex][tenantId] = roleData; // Update the existing role data
    } else {
      // If tenantId doesn't exist, add it with the roleData as a new object
      existingRoles.push({ [tenantId]: roleData });
    }

    // Save updated roles array back to localStorage under the key 'tenantRoles'
    localStorage.setItem("tenantRoles", JSON.stringify(existingRoles));
  };

  // const openRoleModal = (rowData: Record<string, unknown>) => {
  //   setSelectedRowData(rowData);
  //   setIsRoleModalOpen(true);
  // };

  const handleCreateTenantAdmin = (rowData: any) => {
    setSelectedRowData(rowData);
    setIsCreateTenantAdminModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsCreateTenantAdminModalOpen(false);
    setSelectedRowData(null); // Clear selection on close
  };

  const handleRoleChange = (event: any) => {
    setSelectedRole(event.target.value);
  };

  const handleRoleSave = () => {
    if (selectedRole) {
      onAssignRole(selectedRowData, selectedRole);
      closeRoleModal();
    } else {
      alert("Please select a role.");
    }
  };

  const onAssignRole = async (rowData: any, role: any) => {
    try {
      const payload: any = {
        tenantId: rowData?.tenantId,
        roles: [
          {
            title: role,
          },
        ],
      };

      const result = await roleCreate(payload);

      if (result?.responseCode === 200 || result?.responseCode === 201) {
        const roleData = {
          roleId: result?.result?.[0]?.roleId,
          title: role,
        };
        saveOrUpdateRoleInLocalStorage(rowData.tenantId, roleData);
        showToastMessage(t("TENANT.ROLE_ASSIGNED"), "success");
      } else {
        showToastMessage(t("TENANT.ROLE_ASSIGNED_FAILED"), "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     if (selectedRowData) {
  //       const obj = {
  //         limit: "10",
  //         page: 1,
  //         filters: {
  //           tenantId: selectedRowData?.tenantId,
  //         },
  //       };

  //       const response = await rolesList(obj);

  //       if (response?.result) {
  //         const rolesData = response?.result?.map((role: any) => ({
  //           roleId: role?.roleId,
  //           title: role?.title,
  //         }));
  //         setRoles(rolesData);
  //       }
  //     }
  //   };

  //   fetchRoles();
  // }, [isCreateTenantAdminModalOpen, selectedRowData]);

  const role = [Role.TENANT_ADMIN, Role.LEARNER];

  const userProps = {
    userType: t("TENANT.TENANT"),
    searchPlaceHolder: t("TENANT.SEARCH"),
    selectedTenant: selectedTenant,
    selectedSort: selectedSort,
    selectedFilter: selectedFilter,
    handleSortChange: handleSortChange,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    showAddNew: true,
    // showAddNew: true,
    showSearch: true,
    statusArchived: false,
    statusInactive: true,
    handleAddUserClick: handleAddUserClick,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    showSort: false,
  };

  return (
    <ProtectedRoute>
      <ConfirmationModal
        message={
          t("CENTERS.SURE_DELETE_CENTER") +
          inputName +
          " " +
          t("TENANT.TENANT") +
          "?"
        }
        handleAction={() => handleActionForDelete(selectedRowData)}
        buttonNames={
          selectedRowData?.totalActiveMembers > 0
            ? { secondary: t("COMMON.CANCEL") }
            : { primary: t("COMMON.YES"), secondary: t("COMMON.CANCEL") }
        }
        handleCloseModal={handleCloseModal}
        modalOpen={confirmationModalOpen}
      />

      <SimpleModal
        open={Addmodalopen}
        onClose={handleCloseAddModal}
        showFooter={false}
        modalTitle={t("COHORTS.ADD_NEW_COHORT")}
      >
        {cohortSchema && cohortUiSchema && (
          <DynamicForm
            schema={cohortSchema}
            uiSchema={cohortUiSchema}
            onSubmit={handleAddAction}
            onChange={handleChangeForm}
            onError={handleError}
            widgets={{}}
            showErrorList={true}
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
                type="submit"
                form="update-center-form" // Add this line
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "auto",
                  height: "40px",
                  marginLeft: "10px",
                }}
                onClick={handleCloseAddModal}
              >
                {t("COMMON.CANCEL")}
              </Button>

              <Button
                variant="contained"
                type="submit"
                form="update-center-form"
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
      <HeaderComponent 
        {...userProps}
        showDashboard={true}
        dashboardData={{
          total: dashboardTotalCount || 0,
          active: dashboardActiveCount || 0,
          inactive: dashboardInactiveCount || 0,
          type: "Tenants",
          totalIcon: "🏫"
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
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Table Section */}
            {dataFetched && cohortData?.length > 0 ? (
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "15px",
                }}
              >
                <KaTableComponent
                  columns={getTenantTableData(t, isMobile, adminRole)}
                  addAction={true}
                  addBtnFunc={handleCreateTenantAdmin}
                  data={cohortData}
                  limit={pageLimit}
                  roleButton
                  offset={pageOffset}
                  paginationEnable={false}
                  PagesSelector={PagesSelector}
                  pagination={pagination}
                  PageSizeSelector={PageSizeSelectorFunction}
                  pageSizes={pageSizeArray}
                  extraActions={extraActions}
                  showIcons={true}
                  allowEditIcon={true}
                  showReports={true}
                  onEdit={handleEdit}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  handleMemberClick={handleMemberClick}
                  showExport={true}
                  exportFileName="tenants"
                  hiddenExportColumns={[
                    { key: "tenantAdminEmail", title: t("TABLE_TITLE.TENANT_ADMIN_EMAIL") }
                  ]}
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
                  No tenants found
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <AddNewTenant
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
          modalTitle={t("TENANT.UPDATE_TENANT")}
        >
          {schema && uiSchema && (
            <DynamicForm
              schema={schema}
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
                  marginTop: "20px", // Adjust margin as needed
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="submit"
                  form="update-center-form" // Add this line
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

        {/* <SimpleModal
          open={isCreateTenantAdminModalOpen}
          onClose={closeRoleModal}
          modalTitle={`Create Role for ${selectedRowData ? selectedRowData?.name : ""}`}
        >
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Select Role:</Typography>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              fullWidth
              sx={{ mt: 1 }}
            >
              {role?.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={closeRoleModal}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                height: "40px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!selectedRole}
              onClick={handleRoleSave}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                height: "40px",
              }}
            >
              Save
            </Button>
          </Box>
        </SimpleModal> */}
        <SimpleModal
          open={isCreateTenantAdminModalOpen}
          onClose={handleCloseAddModal}
          showFooter={false}
          modalTitle={t("TENANT.ADD_NEW_TENANT_ADMIN")}
        >
          {tenantAdminSchema && tenantAdminUiSchmea && (
            <DynamicForm
              schema={tenantAdminSchema}
              uiSchema={tenantAdminUiSchmea}
              onSubmit={handleAddTenantAdminAction}
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
                  onClick={handleCloseAddModal}
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
      </HeaderComponent>
    </ProtectedRoute>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Tenant;
