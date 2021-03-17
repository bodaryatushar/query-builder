import React, { useState } from 'react';

import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,  
  KeyboardTimePicker,
  KeyboardDateTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const PICKERS = {
  date: KeyboardDatePicker,
  time: KeyboardTimePicker,
  datetime: KeyboardDateTimePicker,
};

const defaultFormat = {
  date: 'DD/MM/YYYY',
  time: 'LT',
  datetime: 'DD/MM/YYYY h:mm a',
};

function DateTimePicker({ inline, type = 'date', ...props }) {
  const [open, setOpen] = useState(false);
  let valueRef = React.useRef();
  const { name, title, format, error, onChange, ...other } = props;
  const Picker = PICKERS[type];

  function onKeyDown(e) {
    if (e.keyCode === 40) setOpen(true);
  }

  function onClose() {
    onChange(valueRef.current);
    setOpen(false);
  }

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Picker
        autoOk={true}
        open={open}
        onChange={value => {
          valueRef.current = value;
        }}
        PopoverProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
        }}
        disableToolbar
        variant="inline"
        {...(inline ? { invalidDateMessage: '' } : {})}
        style={{ width: '100%', ...(inline ? { margin: 0 } : {}) }}
        label={inline ? '' : title}
        format={format || defaultFormat[type]}
        {...(type !== 'time' ? { animateYearScrolling: false } : {})}
        {...other}
        onKeyDown={onKeyDown}
        onClose={onClose}
        onOpen={() => setOpen(true)}
      />
    </MuiPickersUtilsProvider>
  );
}

export default DateTimePicker;
