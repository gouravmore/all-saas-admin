import FingerprintJS from "fingerprintjs2";
import { getUserDetailsInfo } from "../services/UserList";
import { Role, FormContextType, FormValues, InputTypes } from "./app.constant";
import { State } from "./Interfaces";

export const generateUUID = () => {
  let d = new Date().getTime();
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};
export const getUserName = async (userId: string) => {
  try {
    const id = userId;
    const fieldValue = true;
    const userDetails = await getUserDetailsInfo(id, fieldValue);
    console.log("userDetails", userDetails);
    return userDetails?.userData?.name; // Accessing the name property from userData
  } catch (error) {
    console.error("Error in fetching user name:", error);
    return null;
  }
};

export const getDeviceId = () => {
  return new Promise((resolve) => {
    FingerprintJS.get((components: any[]) => {
      const values = components?.map((component) => component.value);
      const deviceId = FingerprintJS.x64hash128(values.join(""), 31);
      resolve(deviceId);
    });
  });
};

export const generateUsernameAndPassword = (
  stateCode: string,
  role: string
) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // Last two digits of the current year
  const randomNum = Math.floor(10000 + Math.random() * 90000).toString(); //NOSONAR

  const rolePrefixes: Record<string, string> = {
    [FormContextType.TEACHER]: "FSC",
    [FormContextType.STUDENT]: "SC",
    [FormContextType.TEAM_LEADER]: "TL",
  };

  if (!(role in rolePrefixes)) {
    console.warn(`Unknown role: ${role}`); // Log a warning for unknown roles
    return null; // Return null or handle as needed
  }

  const prefix = rolePrefixes[role];
  const username = `${prefix}${stateCode}${currentYear}${randomNum}`;

  return { username, password: randomNum };
};

export const transformLabel = (label: string): string => {
  if (!label) {
    return label;
  }
  return label
    .toLowerCase() // Convert to lowercase to standardize
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

export const transformArray = (arr: State[]): State[] => {
  if (!arr) {
    return arr;
  }
  return arr?.map((item) => ({
    ...item,
    label: transformLabel(item.label),
  }));
};

export const firstLetterInUpperCase = (label: string): string | null => {
  if (!label) {
    return null;
  }

  return label
    ?.split(" ")
    ?.map((word) => word?.charAt(0).toUpperCase() + word?.slice(1))
    ?.join(" ");
};
export const capitalizeFirstLetterOfEachWordInArray = (
  arr: string[]
): string[] => {
  if (!arr) {
    return arr;
  }
  console.log(arr);
  return arr.map((str) =>
    str.replace(/\b[a-z]/g, (char) => char.toUpperCase())
  );
};
export const fieldTextValidation = (text: string) => {
  if (!text) {
    return false;
  }
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(text);
};
export const getCurrentYearPattern = () => {
  const currentYear = new Date().getFullYear();
  return `^(19[0-9][0-9]|20[0-${Math.floor(currentYear / 10) % 10}][0-${currentYear % 10}])$`;
};

export const mapFields = (formFields: any, Details: any) => {
  let initialFormData: any = {};
  console.log("Details", Details);

  formFields?.fields.forEach((item: any) => {
    const customFieldValue = Details?.customFields?.find(
      (field: any) => field.fieldId === item.fieldId
    );

    const getValue = (data: any, field: any) => {
      if (item.default) {
        return item.default;
      }
      if (item?.isMultiSelect) {
        if (data[item.name] && item?.maxSelections > 1) {
          return [field?.value];
        } else if (item?.type === InputTypes.CHECKBOX) {
          return String(field?.value).split(",");
        } else {
          return field?.value?.toLowerCase();
        }
      } else if (item?.type === InputTypes.RADIO) {
        return field?.value || null;
      } else if (item?.type === InputTypes.NUMERIC) {
        return parseInt(String(field?.value));
      } else if (item?.type === InputTypes.TEXT) {
        return String(field?.value);
      } else {
        if (
          field?.value === FormValues.FEMALE ||
          field?.value === FormValues.MALE
        ) {
          return field?.value?.toLowerCase();
        }
        return field?.value?.toLowerCase();
      }
    };

    if (item.coreField) {
      if (item?.isMultiSelect) {
        if (Details[item.name] && item?.maxSelections > 1) {
          initialFormData[item.name] = [Details[item.name]];
        } else if (item?.type === "checkbox") {
          initialFormData[item.name] = String(Details[item.name]).split(",");
        } else {
          initialFormData[item.name] = Details[item.name];
        }
      } else if (item?.type === "radio") {
        initialFormData[item.name] = Details[item.name] || null;
      } else if (item?.type === "numeric") {
        initialFormData[item.name] = Number(Details[item.name]);
      } else if (item?.type === "text" && Details[item.name]) {
        initialFormData[item.name] = String(Details[item.name]);
      } else {
        if (Details[item.name]) {
          initialFormData[item.name] = Details[item.name];
        }
      }
    } else {
      const fieldValue = getValue(Details, customFieldValue);

      if (fieldValue) {
        initialFormData[item.name] = fieldValue;
      }
    }
  });

  console.log("initialFormData", initialFormData);
  return initialFormData;
};
