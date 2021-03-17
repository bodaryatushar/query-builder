import React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

function ButtonComp({ title, Icon, onClick }) {
  const classes = useStyles();
  if (!title) {
    return (
      <IconButton onClick={onClick} className={classes.button}>
        <Icon />
      </IconButton>
    );
  }
  return (
    <Button
      variant="contained"
      color="secondary"
      className={classes.button}
      startIcon={<Icon />}
      onClick={onClick}
    >
      {title}
    </Button>
  );
}

export default ButtonComp;
