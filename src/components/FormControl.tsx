import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useMediaQuery } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: "auto",
    },
  },
};

interface MultipleSelectCheckmarksProps {
  names: string[];
  codes: string[];
  tagName: string;
  selectedCategories: string[];
  onCategoryChange: (selectedNames: string[], selectedCodes: string[]) => void;
  disabled?: boolean;
  overall?: boolean;
  defaultValue?: string;
}

const MultipleSelectCheckmarks: React.FC<MultipleSelectCheckmarksProps> = ({
  names,
  codes,
  tagName,
  selectedCategories = [],
  onCategoryChange,
  disabled = false,
  overall = false,
  defaultValue,
}) => {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm")
  );
  const isMediumScreen = useMediaQuery("(max-width:900px)");

  // Sort names alphabetically
  const sortedNames = React.useMemo(() => {
    const nameCodePairs = names.map((name, index) => ({
      name,
      code: codes[index],
    }));
    const sorted = nameCodePairs.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    return sorted;
  }, [names, codes]);

  const handleChange = (
    event: SelectChangeEvent<typeof selectedCategories>
  ) => {
    const {
      target: { value },
    } = event;

    let selectedNames = typeof value === "string" ? value.split(",") : value;

    // Check if "all" (the special option value) is selected, not an actual tenant/cohort name
    // Use a special identifier "__ALL_OPTION__" to distinguish from actual names
    if (selectedNames.includes("all") && !sortedNames.some(item => item.name.toLowerCase() === "all")) {
      selectedNames = defaultValue ? [defaultValue] : ["__ALL_OPTION__"];
    }

    // Map selected names to codes using the sorted/filtered array
    const selectedCodes = selectedNames.map((name) => {
      // If it's the special "All" option, return empty array
      if (name === "__ALL_OPTION__") {
        return "";
      }
      const foundItem = sortedNames.find((item) => item.name === name);
      return foundItem ? foundItem.code : codes[names.indexOf(name)];
    });

    onCategoryChange(selectedNames, selectedCodes);
  };

  return (
    <div>
      <FormControl sx={{ width: "100%" }} disabled={disabled}>
        <InputLabel id="multiple-checkbox-label">{tagName}</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          id="multiple-checkbox"
          value={
            selectedCategories?.length <= 0 || selectedCategories[0] === "" || selectedCategories[0] === "__ALL_OPTION__"
              ? ["all"]
              : selectedCategories
          }
          onChange={handleChange} // Handle the change event for the selection
          input={<OutlinedInput label={tagName} />}
          renderValue={(selected) => {
            // Ensure selected is always an array, even if one item is selected
            const selectedArray = Array.isArray(selected)
              ? selected
              : [selected];

            // Handle the special "All" option
            if (selectedArray.includes("all") || selectedArray.includes("__ALL_OPTION__")) {
              return t("COMMON.ALL");
            }

            // Get the corresponding names for the selected tenant IDs
            const selectedNames = selectedArray
              .map((tenantId) => {
                const index = codes.indexOf(tenantId); // Find the corresponding name using `codes`
                return index >= 0 ? names[index] : tenantId; // Map tenantId to name or return tenantId if not found
              })
              .filter((name) => name !== "" && name !== "__ALL_OPTION__"); // Filter out empty values and special option

            // Return single or multiple selected names
            if (selectedNames.length === 1) {
              return selectedNames[0]; // Return single selected name
            }
            return selectedNames.join(", "); // Join multiple selected names with commas
          }}
          MenuProps={MenuProps}
        >
          {overall && (
            <MenuItem value="all">
              <em>{t("COMMON.ALL")}</em>
            </MenuItem>
          )}

          {/* Render menu items for sorted names */}
          {sortedNames.map((item) => (
            <MenuItem key={item.name} value={item.name}>
              <ListItemText primary={item.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default MultipleSelectCheckmarks;
