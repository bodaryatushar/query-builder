import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Selection } from './component';
import { getSubMetaField } from './services/api';

const useStyles = makeStyles((theme) => ({
  MuiAutocompleteRoot: {
    width: '250px',
    marginRight: '10px',
  },
}));

export default function FieldEditor({ initValue = '', getMetaFields, editor, onChange, value }) {
  const [fields, setFields] = React.useState([]);
  const classes = useStyles();

  React.useEffect(() => {
    (async () => {
      const data = await getMetaFields();
      setFields(data);
    })();
  }, [getMetaFields]);

  const values = value.split('.');
  const [startValue] = values;
  const hasManyValues = value && values.length > 1 && fields.some((x) => x.name === startValue);
  const relationModel = hasManyValues && (fields.find((x) => x.name === startValue) || {}).target;

  function handleChange(value) {
    const isRelationalField = value && fields.some((x) => x.name === value.name && x.target);
    onChange(
      {
        name: 'fieldName',
        value: `${initValue}${value && value.name}${isRelationalField ? '.' : ''}`,
      },
      editor,
    );
    onChange({ name: 'fieldType', value: (value && value.type) || '' }, editor);
    onChange({ name: 'field', value }, editor);
  }
  const transformValue = fields && fields.find((f) => f.name === startValue);
  return (
    <React.Fragment>
      <Selection
        name="fieldName"
        title="Field Name"
        placeholder="field name"
        options={fields}
        optionLabelKey="name"
        onChange={(value) => handleChange(value)}
        value={transformValue}
        classes={{ root: classes.MuiAutocompleteRoot }}
      />
      {hasManyValues && relationModel && (
        <FieldEditor
          getMetaFields={() => getSubMetaField(relationModel)}
          editor={editor}
          initValue={`${initValue}${startValue}.`}
          value={values.slice(1).join('.')}
          onChange={onChange}
        />
      )}
    </React.Fragment>
  );
}
