import React from 'react';
import { List, InputLabel, Chip, IconButton } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    borderBottom: 'solid 1px rgba(0, 0, 0, 0.54)',
    margin: '20px 0 7px 0',
  },
  chip: {
    margin: '4px',
    height: 30,
  },
  list: {
    display: 'flex',
    padding: '0 !important',
  },
  listItem: {
    padding: '0 !important',
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
  buttonContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    bottom: -3,
  },
  inputIconBtn: {
    margin: 0,
    padding: 0,
    color: '#bbb',
  },
}));

export default function Input({ value, onDelete, filters, handleClick, ...rest }) {
  const classes = useStyles();
  return (
    <div className={classes.root} onClick={handleClick}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <InputLabel style={{ width: '100%' }}>Meta Field</InputLabel>
        <List className={classes.list}>
          {value.map((val, index) => (
            <React.Fragment key={index}>
              <Chip label={val.fieldName} onDelete={() => onDelete(val)} className={classes.chip} />
            </React.Fragment>
          ))}
        </List>
      </div>
      <div className={classes.buttonContainer}>
        <IconButton aria-label="open" onClick={handleClick} className={classes.inputIconBtn}>
          <ArrowDropDown />
        </IconButton>
      </div>
    </div>
  );
}
