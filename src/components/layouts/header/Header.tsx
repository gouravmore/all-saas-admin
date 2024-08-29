import React, { useEffect, useRef, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import config from "../../../../config.json";
import PropTypes from "prop-types";
import Image from "next/image";
import TranslateIcon from '@mui/icons-material/Translate';
import Menu from '@mui/material/Menu';
import SearchBar from "./SearchBar";
import { useRouter } from 'next/router';


import { useTranslation } from "next-i18next";
import { createTheme } from "@mui/material/styles";
import Profile from "./Profile";

const Header = ({ sx, customClass, toggleMobileSidebar, position }: any) => {
  const { t } = useTranslation();
  const theme = createTheme();
  const [lang, setLang] = useState("");
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [selectedLanguage, setSelectedLanguage] = useState(lang);

  const [language, setLanguage] = useState(selectedLanguage);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const lang = localStorage.getItem('preferredLanguage') || 'en';
      setLanguage(lang);
   
    }
  }, [setLanguage]);

  const handleChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value;
    setLanguage(newLocale);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('preferredLanguage', newLocale);
      router.replace(router.pathname, router.asPath, { locale: newLocale });
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event)
    setAnchorEl(event.currentTarget);
    console.log(anchorEl)

  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemClick = (newLocale: any) => {
    console.log(newLocale);
    setLanguage(newLocale);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('preferredLanguage', newLocale);
      router.replace(router.pathname, router.asPath, { locale: newLocale });
    }
    handleClose();
  };
  return (
    <AppBar sx={sx} position={position} elevation={0} className={customClass}>
      <Toolbar>
        <IconButton
          size="large"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "flex",
            },
          }}
        >

          <FeatherIcon icon="menu" size="20" />
        </IconButton>
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        {/* <SearchBar
          placeholder={t("NAVBAR.SEARCHBAR_PLACEHOLDER")}
          backgroundColor={theme.palette.background.default}
        /> */}
        {/* ------------ End Menu icon ------------- */}

        <Box flexGrow={1} />

        
<Box
        
        sx={{
          display: "flex",
         // gap:"10px",
          backgroundColor:"white",
         padding:"5px",
        alignItems:"center",
        justifyContent:"center",
          height:"20px",
          width:"30px",
          borderRadius:"10px"
        }}
      >
<IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
             onClick={handleClick}

      >
        <TranslateIcon />
      </IconButton>
      </Box>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}

        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
           // maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
       {config.languages.map((lang) => (
                  <MenuItem value={lang.code} key={lang.code}             onClick={() => handleMenuItemClick(lang.code)}

                  sx={{
                    backgroundColor: lang.code === language ? 'rgba(0, 0, 0, 0.08)' : 'inherit',
                    '&:hover': {
                      backgroundColor: lang.code === language ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                  >
                    {lang.label}
                  </MenuItem>
                ))}
      </Menu>
              <Profile />
        {/* ------------------------------------------- */}
        {/* Profile Dropdown */}
        {/* ------------------------------------------- */}
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
  customClass: PropTypes.string,
  position: PropTypes.string,
  toggleSidebar: PropTypes.func,
  toggleMobileSidebar: PropTypes.func,
};

export default Header;
