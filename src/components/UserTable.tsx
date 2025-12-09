import HeaderComponent from "@/components/HeaderComponent";
import PageSizeSelector from "@/components/PageSelector";
import { Numbers, SORT, Status } from "@/utils/app.constant";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import KaTableComponent from "./KaTableComponent";
import Loader from "./Loader";
import { userList } from "../services/UserList";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { apiCatchingDuration } from "@/utils/app.constant";
import { updateUser } from "@/services/CreateUserService";
import { showToastMessage } from "./Toastify";
import { firstLetterInUpperCase } from "../utils/Helper";
import { getTLTableColumns } from "@/data/tableColumns";
import { Button, useMediaQuery, Card, CardContent, Grid } from "@mui/material";
import { Theme } from "@mui/system";
import { useQuery } from "@tanstack/react-query";
import {
  deleteUser,
  getCohortList,
  getTenantLists,
  rolesList,
} from "@/services/CohortService/cohortService";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { useRouter } from "next/router";
import SimpleModal from "./SimpleModal";
import userJsonSchema from "./UserUpdateSchema.json";
import DynamicForm from "@/components/DynamicForm";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { customFields } from "./GeneratedSchemas";
import ConfirmationModal from "./ConfirmationModal";

type UserDetails = {
  userId: any;
  username: any;
  name: any;
  role: any;
  mobile: any;
  centers?: any;
  Programs?: any;
  age?: any;
  state?: any;
  district?: any;
  blocks?: any;
  stateCode?: any;
  districtCode?: any;
  blockCode?: any;
  centerMembershipIdList?: any;
  blockMembershipIdList?: any;
  cohortIds?: any;
  districtValue?: any;
  mobileNo: string;
  email: string;
  status: string;
};

type FilterDetails = {
  role: any;
  status?: any;
  districts?: any;
  states?: any;
  blocks?: any;
  name?: any;
  cohortId?: any;
  tenantId?: any;
};

interface UserTableProps {
  role: string;
  userType: string;
  searchPlaceholder: string;
  handleAddUserClick: any;
  parentState?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  role,
  userType,
  searchPlaceholder,
  handleAddUserClick,
}) => {
  const [selectedState, setSelectedState] = React.useState<string[]>([]);
  const router = useRouter();

  const setSelectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedBlockStore
  );
  const setSelectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedDistrictStore
  );
  const setSelectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedCenterStore
  );
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const [totalCount, setTotalCount] = useState<number>(0);
  const [dashboardTotalCount, setDashboardTotalCount] = useState<number>(0);
  const [dashboardActiveCount, setDashboardActiveCount] = useState<number>(0);
  const [dashboardInactiveCount, setDashboardInactiveCount] = useState<number>(0);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedBlock, setSelectedBlock] = React.useState<string[]>([]);
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageOffset, setPageOffset] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [data, setData] = useState<UserDetails[]>([]);
  const [cohortsFetched, setCohortsFetched] = useState(false);
  const { t } = useTranslation();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageCount, setPageCount] = useState(1);
  const [deleteUserState, setDeleteUserState] = useState(false);
  const [editUserState, setEditUserState] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string[]>([]);
  const [selectedCenterCode, setSelectedCenterCode] = useState<string[]>([]);
  const [schema, setSchema] = React.useState(userJsonSchema);
  const [listOfCohorts, setListOfCohorts] = useState<any>([]);
  const [updateBtnDisabled, setUpdateBtnDisabled] = React.useState(true);
  const [listOfTenants, setListOfTenants] = useState<any>([]);
  const [selectedTenant, setSelectedTenant] = React.useState<string[]>([]);
  const [selectedCohort, setSelectedCohort] = React.useState<string[]>([]);
  const isMobile: boolean = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const [confirmButtonDisable, setConfirmButtonDisable] = useState(true);
  const [pagination, setPagination] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [formData, setFormData] = useState<any>();

  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState();
  const [submitValue, setSubmitValue] = useState<boolean>(false);
  const [isEditForm, setIsEditForm] = useState<boolean>(false);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>("");

  const uiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Full name, only letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
    },
    // password: {
    //   "ui:widget": "password",
    //   "ui:placeholder": "Enter a secure password",
    //   "ui:help":
    //     "Password must be at least 8 characters long, with at least one letter and one number.",
    // },
    role: {
      "ui:widget": "select",
      "ui:placeholder": "Select a role",
    },
    mobileNo: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your 10-digit mobile number",
      // "ui:help": "Please enter a valid 10-digit mobile number.",
    },
    email: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      "ui:options": {},
    },
    grade: {
      "ui:widget": "text",
      "ui:placeholder": "Enter grade (1-10)",
      "ui:help": "Grade must be a number between 1 and 10",
      "ui:options": {
        "min": 1,
        "max": 10
      }
    },
    status: {
      "ui:widget": "CustomRadioWidget",
      "ui:options": {
        defaultValue: "active",
      },
    },
  };

  const handleOpenAddLearnerModal = () => {
    setIsEditForm(true);
  };
  const onCloseEditForm = () => {
    setIsEditForm(false);
    // setFormData({});
  };

  const [filters, setFilters] = useState<FilterDetails>({
    role: "learner",
    status: [statusValue],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getTenantLists(filters);
        // Sort tenants alphabetically by name
        const sortedTenants = result
          ? [...result].sort((a: any, b: any) =>
              (a?.name || "").localeCompare(b?.name || "", undefined, {
                sensitivity: "base",
              })
            )
          : result;
        setListOfTenants(sortedTenants);
        
        // Check if "All" option is selected (using special identifier) or no tenant is selected
        const selectedTenantOrNot = selectedTenant?.[0] === "__ALL_OPTION__" || !selectedTenant || selectedTenant.length === 0;
        const tenantId = filters?.tenantId
          ? filters?.tenantId
          : selectedTenantOrNot
          ? undefined
          : sortedTenants?.[0]?.tenantId;
        
        let data = {
          limit: 0,
          offset: 0,
          filters: {
            // Only include tenantId if a specific tenant is selected (not "All")
            ...(tenantId && !selectedTenantOrNot ? { tenantId: tenantId } : {}),
            // cohortId: cohortId,
          },
        };
        
        // Fetch cohorts - if "All" is selected, fetch all cohorts without tenantId filter
        const cohortList = await getCohortList(data);
        // Sort cohorts alphabetically by name
        const sortedCohorts = cohortList?.results
          ? [...cohortList.results].sort((a: any, b: any) =>
              (a?.name || "").localeCompare(b?.name || "", undefined, {
                sensitivity: "base",
              })
            )
          : cohortList?.results;
        setListOfCohorts(sortedCohorts || []);
      } catch (error) {
        // console.error("Error fetching data:", error);
        setListOfTenants([]);
        setListOfCohorts([]);
      }
    };

    if (filters) {
      fetchData();
    }
  }, [filters, selectedCohort, selectedTenant]);

  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);
    setSelectedFilter(newValue);
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
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
  };

  const handleDistrictChange = (selected: string[], code: string[]) => {
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }

    setSelectedCenterCode([]);

    // setEnableCenterFilter(false);
    setSelectedCenter([]);

    setSelectedBlock([]);
    setSelectedDistrict(selected);
    setSelectedBlockCode("");
    localStorage.setItem("selectedDistrict", selected[0]);

    setSelectedDistrictStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_DISTRICTS")) {
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          role: "learner",
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          role: "learner",
        });
      }
      if (newQuery.district) {
        delete newQuery.district;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
        },
      });
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
          district: code?.join(","),
        },
      });
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: districts,
          role: "learner",
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: districts,
          role: "learner",
        });
      }
    }
  };
  const handleBlockChange = (selected: string[], code: string[]) => {
    setSelectedCenterCode([]);

    // setEnableCenterFilter(false);
    setSelectedCenter([]);
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }

    setSelectedBlock(selected);
    localStorage.setItem("selectedBlock", selected[0]);
    setSelectedBlockStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_BLOCKS")) {
      if (newQuery.block) {
        delete newQuery.block;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: selectedStateCode,
          district: selectedDistrictCode,
        },
      });
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          role: "learner",
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          role: "learner",
        });
      }
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          // state: selectedStateCode,
          // district: selectedDistrictCode,
          // block: code?.join(",")
        },
      });
      const blocks = code?.join(",");
      setSelectedBlockCode(blocks);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: blocks,
          role: "learner",
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: blocks,
          role: "learner",
        });
      }
    }
  };
  const handleCenterChange = async (selected: string[], code: string[]) => {
    if (code[0]) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          state: selectedStateCode,
          district: selectedDistrictCode,
          block: selectedBlockCode,
          center: code[0],
        },
      });
    } else {
      const newQuery = { ...router.query };
      if (newQuery.center) {
        delete newQuery.center;
        router.replace({
          ...newQuery,
        });
      }
    }

    setSelectedCenterCode([code[0]]);

    setSelectedCenter(selected);
    localStorage.setItem("selectedCenter", selected[0]);
    setSelectedCenterStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_CENTERS")) {
      // setEnableCenterFilter(false);
      setSelectedCenterCode([]);
      if (filters.status) {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: selectedBlockCode,
          role: "learner",
          status: filters.status,
        });
      } else {
        setFilters({
          // states: selectedStateCode,
          // districts: selectedDistrictCode,
          // blocks: selectedBlockCode,
          role: "learner",
        });
      }
    } else {
      // setEnableCenterFilter(true);

      setFilters({
        // states: selectedStateCode,
        // districts: selectedDistrictCode,
        // blocks: blocks,
        cohortId: code[0],
        role: "learner",
        status: [statusValue],
      });
    }
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    if (data?.length > 0) {
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

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     const obj = {
  //       limit: "10",
  //       page: 1,
  //       filters: {
  //         tenantId: formData?.tenantId,
  //       },
  //     };

  //     try {
  //       const response = await rolesList(obj);

  //       if (response?.result) {
  //         const rolesOptions = response.result.map((role: any) => ({
  //           const: role.roleId,
  //           title: role.title,
  //         }));

  //         setSchema((prevSchema) => ({
  //           ...prevSchema,
  //           properties: {
  //             ...prevSchema.properties,
  //             // role: {
  //             //   ...prevSchema.properties?.role,
  //             //   oneOf: rolesOptions,
  //             // },
  //           },
  //         }));
  //       }
  //     } catch (error) {
  //
  //     }
  //   };

  //   if (isEditForm) {
  //     fetchRoles();
  //   }
  // }, [isEditForm, formData?.tenantId]);

  const handleEdit = (rowData: any) => {
    setSubmitValue((prev) => !prev);
    setIsEditForm(true);
    setUpdateBtnDisabled(true);
    const userId = rowData?.userId;
    setUserId(userId);

    if (rowData) {
      setSelectedRowData(rowData);
    }
    const initialFormData = {
      userId: rowData.userId || "",
      name: rowData.name || "",
      mobileNo: rowData.mobile || "",
      email: rowData.email || "",
      username: rowData.username.replace(/\s/g, "") || "",
      role: rowData.role || "",
      grade: rowData.grade || "",
      status: rowData.status || "active",
    };

    setFormData(initialFormData);

    handleOpenAddLearnerModal();
  };

  const handleSearch = (keyword: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: keyword,
    }));
  };

  // Fetch dashboard counts (total, active, inactive) - without status filter
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const tenantId = filters?.tenantId && filters?.tenantId;
        const selectedTenantOrNot = selectedTenant?.[0] === "__ALL_OPTION__" || !selectedTenant || selectedTenant.length === 0;
        const selectedCohortOrNot = selectedCohort?.[0] === "__ALL_OPTION__" || !filters?.cohortId;
        
        // Fetch total count (no status filter)
        const totalPayload = {
          limit: 0,
          filters: {
            role: filters.role,
            name: filters?.name,
          },
          tenantCohortRoleMapping: {
            ...(selectedTenantOrNot ? {} : { tenantId: tenantId }),
            // Only include cohortId if a specific cohort is selected (not "All")
            ...(selectedCohortOrNot ? {} : { cohortId: filters?.cohortId ? [filters?.cohortId] : [] }),
          },
          sort: sortBy,
          offset: 0,
        };
        const totalResp = await userList({ payload: totalPayload, tenantId });
        const total = totalResp?.total_count || 0;
        setDashboardTotalCount(total);

        // Fetch active count
        const activePayload = {
          limit: 0,
          filters: {
            role: filters.role,
            status: [Status.ACTIVE],
            name: filters?.name,
          },
          tenantCohortRoleMapping: {
            ...(selectedTenantOrNot ? {} : { tenantId: tenantId }),
            // Only include cohortId if a specific cohort is selected (not "All")
            ...(selectedCohortOrNot ? {} : { cohortId: filters?.cohortId ? [filters?.cohortId] : [] }),
          },
          sort: sortBy,
          offset: 0,
        };
        const activeResp = await userList({ payload: activePayload, tenantId });
        const active = activeResp?.total_count || 0;
        setDashboardActiveCount(active);

        // Fetch inactive count
        const inactivePayload = {
          limit: 0,
          filters: {
            role: filters.role,
            status: [Status.INACTIVE],
            name: filters?.name,
          },
          tenantCohortRoleMapping: {
            ...(selectedTenantOrNot ? {} : { tenantId: tenantId }),
            // Only include cohortId if a specific cohort is selected (not "All")
            ...(selectedCohortOrNot ? {} : { cohortId: filters?.cohortId ? [filters?.cohortId] : [] }),
          },
          sort: sortBy,
          offset: 0,
        };
        const inactiveResp = await userList({ payload: inactivePayload, tenantId });
        const inactive = inactiveResp?.total_count || 0;
        setDashboardInactiveCount(inactive);
      } catch (error: any) {
        // Silently handle errors for dashboard counts
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardCounts();
  }, [
    filters.role,
    filters.tenantId,
    filters.cohortId,
    filters.name,
    selectedTenant,
    editUserState,
    deleteUserState,
  ]);

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        // const fields = ["age", "districts", "states", "blocks", "gender"];
        let limit = 0;
        let offset = pageOffset * pageSize;

        if (filters.name) {
          offset = 0;
        }
        const tenantId = filters?.tenantId && filters?.tenantId;

        const selectedTenantOrNot = selectedTenant?.[0] === "__ALL_OPTION__" || !selectedTenant || selectedTenant.length === 0;
        const selectedCohortOrNot = selectedCohort?.[0] === "__ALL_OPTION__" || !filters?.cohortId;
        
        const payload = {
          limit,
          filters: {
            role: filters.role,
            status: filters.status,
            name: filters?.name,
          },
          tenantCohortRoleMapping: {
            ...(selectedTenantOrNot ? {} : { tenantId: tenantId }),
            // Only include cohortId if a specific cohort is selected (not "All")
            ...(selectedCohortOrNot ? {} : { cohortId: filters?.cohortId ? [filters?.cohortId] : [] }),
          },
          sort: sortBy,
          offset,
        };
        const resp = await userList({ payload, tenantId });
        const totalCount = resp?.total_count || 0;
        setTotalCount(totalCount);
        setPagination(totalCount > 0);
        if (totalCount >= 15) {
          setPageSizeArray([5, 10, 15]);
        } else if (totalCount >= 10) {
          setPageSizeArray([5, 10]);
        } else if (totalCount > 5) {
          setPageSizeArray([5]);
        } else {
          setPageSizeArray([totalCount]);
        }

        const pageCounts =
          totalCount > 0 ? Math.ceil(totalCount / pageLimit) : 1;
        setPageCount(pageCounts);

        // if (pageOffset >= pageCounts - 1) {
        //   setPageOffset(pageCounts - 1);
        // }
        const finalResult = resp?.getUserDetails?.map((user: any) => {
          const ageField = user?.customFields?.find(
            (field: any) => field?.label === "AGE"
          );
          const genderField = user?.customFields?.find(
            (field: any) => field?.label === "GENDER"
          );
          const blockField = user?.customFields?.find(
            (field: any) => field?.label === "BLOCKS"
          );
          const districtField = user?.customFields?.find(
            (field: any) => field?.label === "DISTRICTS"
          );
          const stateField = user?.customFields?.find(
            (field: any) => field?.label === "STATES"
          );

          // Find tenant name from listOfTenants
          const matchingTenant = listOfTenants.find(
            (tenant: any) => tenant?.tenantId === user?.tenantId
          );
          const tenantName = matchingTenant?.name || "-";

          // Find cohort name from listOfCohorts
          // Check if user has cohortIds (array) or cohortId (single)
          const userCohortIds = user?.cohortIds || (user?.cohortId ? [user.cohortId] : []);
          let cohortName = "-";
          
          if (userCohortIds && userCohortIds.length > 0) {
            // Find the first matching cohort
            const matchingCohort = listOfCohorts.find((cohort: any) =>
              userCohortIds.includes(cohort?.cohortId)
            );
            cohortName = matchingCohort?.name || "-";
            
            // If multiple cohorts, show first one with count
            if (userCohortIds.length > 1 && matchingCohort) {
              cohortName = `${matchingCohort.name} (+${userCohortIds.length - 1})`;
            }
          }

          return {
            userId: user.userId,
            username: user.username,
            status: user.status,
            email: user.email ? user.email : "-",
            tenantId: user.tenantId,
            tenantName: tenantName,
            cohortName: cohortName,
            name:
              user.name.charAt(0).toUpperCase() +
              user.name.slice(1).toLowerCase(),
            role: user.role ? user.role : "Public",
            mobile: user.mobile ? user.mobile : "-",
            grade: user.grade ? user.grade : "-",
            age: ageField ? ageField?.value : " - ",
            district: districtField
              ? districtField?.value +
                " , " +
                firstLetterInUpperCase(blockField?.value)
              : "-",
            state: stateField ? stateField?.value : "-",
            blocks: blockField
              ? firstLetterInUpperCase(blockField?.value)
              : "-",
            gender: genderField
              ? genderField.value?.charAt(0)?.toUpperCase() +
                genderField.value.slice(1).toLowerCase()
              : "-",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
            stateCode: stateField?.code,
            districtCode: districtField?.code,
            blockCode: blockField?.code,
            districtValue: districtField ? districtField?.value : "-",
          };
        });

        if (filters?.name) {
          const prioritizedResult = finalResult.sort((a: any, b: any) => {
            const aStartsWith = a.name.toLowerCase().startsWith(filters?.name);
            const bStartsWith = b.name.toLowerCase().startsWith(filters?.name);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
          });

          setData(prioritizedResult);
        } else {
          setData(finalResult);
        }

        setLoading(false);
        setCohortsFetched(false);
      } catch (error: any) {
        setLoading(false);

        if (error?.response && error?.response.status === 404) {
          setData([]);
        }
      }
    };

    fetchUserList();
  }, [
    pageOffset,
    // submitValue,
    pageLimit,
    sortBy,
    filters,
    editUserState,
    deleteUserState,
    listOfTenants,
    listOfCohorts,
    // parentState,
    // userType,
    // editUserState,
    // selectedTenant,
    // selectedCohort,
  ]);

  const handleTenantChange = (
    selectedNames: string[],
    selectedCodes: string[]
  ) => {
    if (selectedNames && selectedNames.length > 0) {
      setSelectedTenant(selectedNames);

      setSelectedCohort([]);
      setFilters((prevFilter) => {
        const newFilters = { ...prevFilter };

        // Check for the special "All" option identifier, not an actual tenant named "All"
        if (selectedNames?.[0] === "__ALL_OPTION__" || (selectedNames?.[0] === "All" && (!selectedCodes || selectedCodes[0] === ""))) {
          delete newFilters.tenantId;
        } else if (selectedCodes && selectedCodes.length > 0 && selectedCodes[0] !== "") {
          const tenantId = selectedCodes.join(",");
          newFilters.tenantId = tenantId;
        }
        delete newFilters.cohortId;

        return newFilters;
      });
    } else {
      console.log("No valid tenants selected");
    }
  };
  const handleChange = (event: SelectChangeEvent<typeof pageSize>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setPageLimit(newPageSize);
    // setPageOffset(0);
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value >= 1 && value <= pageCount) {
      setPageOffset(value - 1);
    }
  };

  useEffect(() => {
    const calculatePageSizes = (total: number) => {
      if (total >= 15) return [5, 10, 15];
      if (total >= 10) return [5, 10];
      if (total > 5) return [5];
      return [total];
    };

    setPageSizeArray(calculatePageSizes(totalCount));
    setPageCount(Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const PagesSelector = () => (
    <Box sx={{ display: { xs: "block" } }}>
      <Pagination
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
    <PageSizeSelector
      handleChange={handleChange}
      pageSize={pageSize}
      options={pageSizeArray}
    />
  );
  const handleDelete = (rowData: any) => {
    setConfirmationModalOpen(true);
    setSelectedRowData(rowData);
  };
  const handleConfirmDelete = async () => {
    if (selectedRowData?.userId) {
      const userId = selectedRowData.userId;
      const cohortDetails = {
        status: Status.ARCHIVED,
      };

      try {
        const tenantId = selectedRowData.tenantId
        const resp = await deleteUser(userId,tenantId);
        if (resp?.responseCode === 200) {
          showToastMessage(t("COMMON.USER_DELETE_SUCCSSFULLY"), "success");
          setDeleteUserState((prevState) => !prevState);

          setConfirmationModalOpen(false);
        } else {
          showToastMessage(t("COMMON.USER_DELETE_FAILED"), "error");
        }
      } catch (error) {
        showToastMessage(t("COMMON.USER_DELETE_FAILED"), "error");
      }
    } else {
      showToastMessage(t("COMMON.SOMETHING_WENT_WRONG"), "error");
    }
  };

  const extraActions: any = [
    { name: "Edit", onClick: handleEdit, icon: EditIcon },
    { name: "Delete", onClick: handleDelete, icon: DeleteIcon },
  ];

  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;
    const schemaProperties = schema.properties;

    try {
      setLoading(true);
      setConfirmButtonDisable(true);
      // if (!selectedCohortId) {
      //   showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
      //   return;
      // }
      const formatName = (names: any) => {
        return names?.trim().replace(/\s+/g, " ");
      };
      let cohortDetails = {
        userData: {
          name: formatName(formData?.name),
          role: formData?.role,
          userId: formData?.userId,
          username: formData?.username.replace(/\s/g, ""),
          mobile: formData?.mobileNo,
          email: formData?.email,
          grade: formData?.grade,
          status: formData?.status || "active",
          // customFields: customFields,
        },
      };
      const tenantid = selectedRowData?.tenantId;
      const resp = await updateUser(formData?.userId, cohortDetails, tenantid);
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("USER.UPDATE_SUCCESSFULLY"), "success");
        setEditUserState((state) => !state);
        setLoading(false);
      } else {
        showToastMessage(t("USER.FAILED_TO_UPDATE"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("USER.FAILED_TO_UPDATE");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      onCloseEditForm();
      setIsEditForm(false);
    }
  };

  const handleChangeForm = (event: IChangeEvent<any>) => {
    setUpdateBtnDisabled(false);
  };
  const handleError = (error: any) => {};

  const handleCohortChange = (
    selectedNames: string[],
    selectedCodes: string[]
  ) => {
    if (selectedNames && selectedNames.length > 0) {
      setSelectedCohort(selectedNames);
      
      // Check for the special "All" option identifier, not an actual cohort named "All"
      if (selectedNames?.[0] === "__ALL_OPTION__" || (selectedNames?.[0] === "All" && (!selectedCodes || selectedCodes[0] === ""))) {
        // If "All" is selected, remove cohortId filter
        setFilters((prevFilter) => {
          const newFilters = { ...prevFilter };
          delete newFilters.cohortId;
          return newFilters;
        });
      } else if (selectedCodes && selectedCodes.length > 0 && selectedCodes[0] !== "") {
        // Only set cohortId if we have valid codes and it's not "All"
        const cohortId = selectedCodes.join(",");
        setFilters((prevFilter) => ({
          ...prevFilter,
          cohortId: cohortId,
        }));
      } else {
        // If no valid codes, remove cohortId filter
        setFilters((prevFilter) => {
          const newFilters = { ...prevFilter };
          delete newFilters.cohortId;
          return newFilters;
        });
      }
    } else {
      console.log("No valid cohort selected");
      setSelectedCohort([]);
      setFilters((prevFilter) => {
        const newFilters = { ...prevFilter };
        delete newFilters.cohortId;
        return newFilters;
      });
    }
  };

  const userProps = {
    tenants: listOfTenants,
    cohorts: listOfCohorts,
    showAddNew: false,
    showSort: false,
    userType: userType,
    searchPlaceHolder: searchPlaceholder,
    selectedState: selectedState,
    selectedDistrict: selectedDistrict,
    setSelectedDistrict: setSelectedDistrict,
    selectedBlock: selectedBlock,
    setSelectedBlock: setSelectedBlock,
    selectedSort: selectedSort,
    statusValue: statusValue,
    selectedTenant: selectedTenant,
    selectedCohort: selectedCohort,
    handleTenantChange: handleTenantChange,
    // setStatusValue: setStatusValue,
    handleCohortChange: handleCohortChange,
    handleDistrictChange: handleDistrictChange,
    handleBlockChange: handleBlockChange,
    handleSortChange: handleSortChange,
    selectedFilter: selectedFilter,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    handleAddUserClick: handleAddUserClick,
    selectedBlockCode: selectedBlockCode,
    setSelectedBlockCode: setSelectedBlockCode,
    selectedDistrictCode: selectedDistrictCode,
    setSelectedDistrictCode: setSelectedDistrictCode,
    selectedStateCode: selectedStateCode,
    handleCenterChange: handleCenterChange,
    selectedCenter: selectedCenter,
    setSelectedCenter: setSelectedCenter,
    selectedCenterCode: selectedCenterCode,
    setSelectedCenterCode: setSelectedCenterCode,
    setSelectedStateCode: setSelectedStateCode,
    statusArchived: false,
    statusInactive: true,
    isTenantShow: true,
    isCohortShow: true,
    //  statusArchived:true,
  };

  return (
      <HeaderComponent 
      {...userProps}
      showDashboard={true}
        dashboardData={{
          total: dashboardTotalCount || 0,
          active: dashboardActiveCount || 0,
          inactive: dashboardInactiveCount || 0,
          type: "Learners",
          totalIcon: "🧑‍🎓"
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
          {data?.length !== 0 && loading === false ? (
            <Box
              sx={{
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "15px",
              }}
            >
              <KaTableComponent
                columns={
                  getTLTableColumns(t, isMobile, filters)
                }
                data={data}
                limit={pageLimit}
                offset={pageOffset}
                paginationEnable={totalCount > Numbers.TEN}
                PagesSelector={PagesSelector}
                PageSizeSelector={PageSizeSelectorFunction}
                pageSizes={pageSizeArray}
                extraActions={extraActions}
                showIcons={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pagination={pagination}
                allowEditIcon={true}
                showReports={true}
                showLearnerReports={true}
                showResetPassword={true}
                noDataMessage={data?.length === 0 ? t("COMMON.NO_USER_FOUND") : ""}
                showExport={true}
                exportFileName="learners"
              />
            </Box>
          ) : (
            loading === false &&
            data.length === 0 && (
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
                <PersonSearchIcon fontSize="large" sx={{ color: "#ccc", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t("COMMON.NO_USER_FOUND")}
                </Typography>
              </Box>
            )
          )}
        </Box>
      )}

      <SimpleModal
        open={isEditForm}
        onClose={onCloseEditForm}
        showFooter={false}
        modalTitle={t("USER.UPDATE_USER_DETAILS")}
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
            formData={formData}
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

      <ConfirmationModal
        message={t("USER.DELETE_USER_CONFIRMATION_MESSAGE")}
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.YES"),
          secondary: t("COMMON.CANCEL"),
        }}
        handleCloseModal={() => setConfirmationModalOpen(false)}
        modalOpen={confirmationModalOpen}
      />
    </HeaderComponent>
  );
};

export default UserTable;
