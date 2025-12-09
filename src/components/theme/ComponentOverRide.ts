import { Components, Theme } from "@mui/material";

const components: Components<Omit<Theme, "components">> = {
  MuiCssBaseline: {
    styleOverrides: {
      "*": {
        boxSizing: "border-box",
      },
      html: {
        height: "100%",
        width: "100%",
      },
      body: {
        height: "100%",
        margin: 0,
        padding: 0,
        fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
      },
      "#root": {
        height: "100%",
      },
      // Custom scrollbar styling
      "::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "#f1f1f1",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "#c1c1c1",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "#a8a8a8",
        },
      },
      ".MuiCardHeader-action": {
        alignSelf: "center !important",
      },
      ".scrollbar-container": {
        borderRight: "0 !important",
      },
      // Loading skeleton styles
      ".skeleton-loading": {
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      "@keyframes pulse": {
        "0%, 100%": {
          opacity: 1,
        },
        "50%": {
          opacity: 0.5,
        },
      },
    },
  },

  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: "16px !important",
        paddingRight: "16px !important",
        maxWidth: "1600px",
        "@media (min-width: 600px)": {
          paddingLeft: "24px !important",
          paddingRight: "24px !important",
        },
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        borderRadius: "12px",
        fontWeight: 500,
        fontSize: "0.875rem",
        padding: "10px 20px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-1px)",
        },
        "&:active": {
          transform: "translateY(0px)",
        },
        "&.Mui-disabled": {
          opacity: 0.6,
        },
      },
      containedPrimary: {
        background: "linear-gradient(135deg, #2581C4 0%, #1976d2 100%)",
        color: "#ffffff",
        "&:hover": {
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        },
      },
      outlinedPrimary: {
        borderColor: "#2581C4",
        color: "#2581C4",
        "&:hover": {
          backgroundColor: "rgba(37, 129, 196, 0.04)",
          borderColor: "#1976d2",
        },
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "16px",
        padding: "20px",
        margin: "8px 0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-2px)",
        },
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2581C4",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2581C4",
            borderWidth: "2px",
          },
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#2581C4",
        },
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: "12px",
        margin: "4px 8px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor: "rgba(37, 129, 196, 0.08)",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(37, 129, 196, 0.12)",
          "&:hover": {
            backgroundColor: "rgba(37, 129, 196, 0.16)",
          },
        },
      },
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: "48px",
        color: "inherit",
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: "20px",
        fontWeight: 500,
        fontSize: "0.75rem",
        height: "32px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        },
      },
      colorPrimary: {
        backgroundColor: "#2581C4",
        color: "#ffffff",
      },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        backgroundColor: "#e3f2fd",
        borderRadius: "8px",
        height: "8px",
        overflow: "hidden",
      },
      bar: {
        borderRadius: "8px",
        background: "linear-gradient(90deg, #2581C4 0%, #1976d2 100%)",
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        margin: "2px 8px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor: "rgba(37, 129, 196, 0.08)",
        },
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-head": {
          backgroundColor: "#2581C4 !important",
          color: "white !important",
          fontWeight: "600 !important",
          fontSize: "14px !important",
          padding: "12px 16px !important",
          textAlign: "center !important",
          borderBottom: "1px solid #e0e0e0 !important",
        },
      },
    },
  },

  MuiTableBody: {
    styleOverrides: {
      root: {
        "& .MuiTableRow-root:nth-of-type(odd)": {
          backgroundColor: "#EAF2FF !important",
          "& .MuiTableCell-root": {
            backgroundColor: "#EAF2FF !important",
          },
        },
        "& .MuiTableRow-root:nth-of-type(even)": {
          backgroundColor: "#FFFFFF !important",
          "& .MuiTableCell-root": {
            backgroundColor: "#FFFFFF !important",
          },
        },
        "& .MuiTableRow-root:hover": {
          backgroundColor: "rgba(37, 129, 196, 0.08) !important",
          "& .MuiTableCell-root": {
            backgroundColor: "rgba(37, 129, 196, 0.08) !important",
          },
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: "12px 16px !important",
        fontSize: "14px !important",
        lineHeight: "24px !important",
        textAlign: "center",
        borderBottom: "1px solid #e0e0e0 !important",
        overflow: "hidden !important",
        textOverflow: "ellipsis !important",
        whiteSpace: "nowrap !important",
        maxWidth: "100% !important",
      },
    },
  },

  MuiPagination: {
    styleOverrides: {
      root: {
        "& .MuiPaginationItem-root": {
          borderRadius: "8px",
          margin: "0 2px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "rgba(37, 129, 196, 0.08)",
          },
          "&.Mui-selected": {
            backgroundColor: "#2581C4",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1976d2",
            },
          },
        },
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: "24px",
        padding: "0",
        boxShadow: "0 32px 64px rgba(0, 0, 0, 0.2)",
        maxWidth: "500px",
        width: "90vw",
        maxHeight: "90vh",
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(37, 129, 196, 0.1)",
        backdropFilter: "blur(10px)",
      },
      paperScrollPaper: {
        display: "flex",
        flexDirection: "column",
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: "1.5rem",
        fontWeight: "700",
        padding: "24px 24px 16px 24px",
        margin: "0",
        background: "linear-gradient(135deg, #2581C4 0%, #1976d2 100%)",
        color: "white",
        borderRadius: "24px 24px 0 0",
        textAlign: "center",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "4px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "2px",
        },
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: "24px",
        backgroundColor: "#ffffff",
        "&:last-child": {
          paddingBottom: "24px",
        },
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: "16px 24px 24px 24px",
        backgroundColor: "#f8fafc",
        borderRadius: "0 0 24px 24px",
        gap: "12px",
        justifyContent: "flex-end",
      },
    },
  },

  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        marginBottom: "8px",
        "& .MuiRadio-root": {
          color: "#2581C4",
          "&.Mui-checked": {
            color: "#2581C4",
          },
        },
        "& .MuiFormControlLabel-label": {
          color: "#374151",
          fontWeight: "500",
        },
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        "&.MuiDialogTitle-root + .MuiIconButton-root": {
          position: "absolute",
          top: "16px",
          right: "16px",
          color: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
          },
        },
      },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: "#374151",
        borderRadius: "8px",
        fontSize: "0.75rem",
        padding: "8px 12px",
      },
      arrow: {
        color: "#374151",
      },
    },
  },

  MuiGrid: {
    styleOverrides: {
      root: {
        "&.MuiGrid-item": {
          paddingTop: "16px",
          paddingLeft: "16px",
        },
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "2px 0 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
};

export default components;
