import React, { useEffect } from "react";
import { TextField, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  listbox: {
    maxHeight: "300px !important",
  },
}));
export default function AutoComplete(props) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [selectedValue, setSelectedValue] = React.useState(
    props.isMulti ? [] : null
  );
  const [inputValue, setInputValue] = React.useState("");
  const loading = open && options.length === 0;
  const {
    value,
    onChange,
    options: flatOptions,
    optionLabelKey = "title",
    optionValueKey = "id",
    isMulti,
    title,
    fetchAPI,
    inline,
    InputProps,
    error,
    filterSelectedOptions = false,
    disableCloseOnSelect = true,
    ...other
  } = props;

  const classes = useStyles();

  const findOption = React.useCallback(
    (option) => {
      return flatOptions.find((i) => i && i[optionValueKey] === option.trim());
    },
    [flatOptions, optionValueKey]
  );

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

     fetchAPI
      ? (async () => {
          const data = await fetchAPI({ search: "" });

          if (active) {
            setOptions(data);
          }
        })()
      : setOptions(flatOptions);

    return () => {
      active = false;
    };
  }, [loading, fetchAPI, flatOptions]);

  useEffect(() => {
    function onResize() {
      setOpen(false);
    }
    if (!open) {
      setOptions([]);
    } else {
      window.addEventListener("resize", onResize, true);
      return () => window.removeEventListener("scroll", onResize);
    }
  }, [open]);

  useEffect(() => {
    if (typeof value === "string") {
      const values = value.split(",");
      setSelectedValue(
        isMulti ? values.map((v) => findOption(v)) : findOption(values[0])
      );
    } else {
      setSelectedValue(value ? value : isMulti ? [] : null);
    }
  }, [value, isMulti, findOption]);

  function onKeyDown(e) {
    if (e.key === "Backspace") {
      if (selectedValue && selectedValue[optionLabelKey] === inputValue) {
        onChange(null);
      }
    }
  }

  function handleChange(item) {
    if (typeof value === "string") {
      isMulti
        ? onChange(item.map((i) => i && i[optionValueKey]).join(",") || [])
        : onChange(item && item[optionValueKey]);
    } else {
      onChange(item);
    }
  }

  return (
    <Autocomplete
      getOptionLabel={(option) => {
        return (option && option[optionLabelKey]) || "";
      }}
      id="select-widget"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedValue}
      onChange={(event, newValue) => handleChange(newValue)}
      options={options}
      loading={loading}
      multiple={isMulti}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(e, value) => setInputValue(value)}
      classes={{ option: "menu-item", listbox: classes.listbox }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            error={error}
            label={inline ? "" : title}
            fullWidth
            onClick={() => setOpen(true)}
            InputProps={{
              ...InputProps,
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            {...(isMulti ? {} : { onKeyDown: onKeyDown })}
          />
        );
      }}
      {...(isMulti ? { disableCloseOnSelect } : {})}
      {...other}
    />
  );
}
