import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import { Select, FormControl, InputLabel } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  select: {
    width: "150px",
  },
}));

export default function Selection({
  name,
  value = "",
  onChange,
  options,
  title,
  ...rest
}) {
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <InputLabel>{title}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        style={{ marginRight: 8 }}
        classes={{ select: classes.select }}
        {...rest}
      >
        {options &&
          options.map(({ name, title }, index) => (
            <MenuItem value={name} key={index}>
              {title}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}