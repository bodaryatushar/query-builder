import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, InputLabel } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import classNames from 'classnames'
import produce from "immer";
import Editor from "./editor";
import { Select, Selection, Button } from "./component";
import { getMetaModals, getMetaFields } from "./services/api";
import { queryType, map_operator } from "./data";

const useStyles = makeStyles((theme) => ({
  Container: {
    display: "flex",
  },
  rulesGroupHeader: {
    display: "flex",
  },
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(3, 2),
  },
  rules: {
    display: "flex",
  },
  MuiAutocompleteRoot: {
    width: "100%",
    marginRight: "10px",
  },
  title: {
    flexGrow: 1,
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.5,
  }
}));

let id = 0;

const defaultRules = [
  {
    id,
    parentId: -1,
    combinator: "and",
    rules: [{}],
  },
];

function QueryBuilder() {
  const [metaModals, setMetaModals] = React.useState();
  const [metaFields, setMetaFields] = React.useState([]);
  const [type, setType] = React.useState("select");
  const [rules, setRules] = React.useState(defaultRules);
  const [query, setQuery] = React.useState("");
  const classes = useStyles();
  const fields = metaModals && metaModals.metaFields.map((f) => f.name);

  function onAddGroup(parentId) {
    id = id + 1;
    setRules((state) => [...state, { id, parentId, rules: [] }]);
  }

  function onRemoveGroup(id) {
    setRules(
      produce((draft) => {
        const index = rules.findIndex((r) => r.id === id);
        draft.splice(index, 1);
      })
    );
  }

  function onAddRule(editorId, rule = {}) {
    setRules(
      produce((draft) => {
        const editorIndex = rules.findIndex((i) => i.id === editorId);
        draft[editorIndex].rules = [...draft[editorIndex].rules, rule];
      })
    );
  }

  function onRemoveRule(editorId, index) {
    setRules(
      produce((draft) => {
        const editorIndex = rules.findIndex((i) => i.id === editorId);
        draft[editorIndex].rules.splice(index, 1);
      })
    );
  }

  const getChildEditors = (parentId) => {
    return rules.filter((editor) => editor.parentId === parentId);
  };

  function onChange({ name, value }, editor, index) {
    setRules(
      produce((draft) => {
        const editorIndex = rules.findIndex((i) => i.id === editor.id);
        if (index >= 0) {
          draft[editorIndex].rules[index] = {
            ...draft[editorIndex].rules[index],
            [name]: value,
          };
        } else {
          draft[editorIndex][name] = value;
        }
      })
    );
  }

  function getCondition(rules) {
    return rules.map((rule) => {
      const { fieldName, operator } = rule;
      if (!fieldName) {
        return null;
      }
      const name = fieldName && fieldName.name;
      let { fieldValue, fieldValue2 } = rule;
      const type = fieldName && fieldName.type.toLowerCase();
      const isNumber = ["long", "integer", "decimal", "boolean"].includes(type);
      const isRelational = [
        "one_to_one",
        "many_to_one",
        "many_to_many",
        "one_to_many",
      ].includes(type);

      if (isRelational) {
        if (["in", "notIn"].includes(operator)) {
          const value = fieldValue.map((v) => v.id);
          return `${name}.id ${map_operator[operator]} [${value}]`;
        } else if (["isNotNull", "isNull"].includes(operator)) {
          return `${"self." + name + "." + fieldName.targetName} ${
            map_operator[operator]
          }`;
        } else {
          return `${"self." + name + "." + fieldName.targetName} ${
            map_operator[operator]
          } "${fieldValue}"`;
        }
      }

      if (!isNumber) {
        fieldValue = `"${fieldValue}"`;
        fieldValue2 = `"${fieldValue2}"`;
      }

      if (["between", "notBetween"].includes(operator)) {
        return `${"self." + name} ${
          map_operator[operator]
        } ${fieldValue} and ${fieldValue2}`;
      } else if (["isNotNull", "isNull"].includes(operator)) {
        return `${"self." + name} ${map_operator[operator]}`;
      } else if (["isTrue", "isFalse"].includes(operator)) {
        const value = operator === "isTrue" ? true : false;
        return `${"self." + name} = ${value}`;
      } else {
        return `${"self." + name} ${map_operator[operator]} ${fieldValue}`;
      }
    });
  }

  function getCriteria(rule, isChildren) {
    const { rules, combinator, children } = rule[0];
    const condition = getCondition(rules);
    if (children.length > 0) {
      const conditions = getCriteria(children, true);
      condition.push(conditions);
    }
    if (isChildren) {
      return " (" + condition.join(" " + combinator.toUpperCase() + " ") + ") ";
    } else {
      return condition.join(" " + combinator.toUpperCase() + " ");
    }
  }

  function getListOfTree(list) {
    var map = {},
      node,
      roots = [];
    const rules = list.map((item, index) => {
      map[item.id] = index;
      return { ...item, children: [] };
    });
    for (let i = 0; i < rules.length; i += 1) {
      node = rules[i];
      if (node.parentId >= 0) {
        rules[map[node.parentId]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  function generateQuery() {
    let str = "";

    const getSelectedFields = (metaFields) => {
      const fields = metaFields.map((f) => "self." + f.name);
      return fields.join(",");
    };

    const listOfTree = getListOfTree(rules);
    const criteria = getCriteria(listOfTree);
    const model = metaModals && metaModals.name;
    const selectedFields =
      metaFields && metaFields.length > 0 ? getSelectedFields(metaFields) : "*";

    if (metaModals) {
      str += `${type.toUpperCase()} ${selectedFields} FROM ${model} self `;
      if (criteria) {
        str += `WHERE ${criteria}`;
      }
    } else {
      return "Invalid query";
    }
    return str + ";";
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Query Builder
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper variant="outlined" className={classes.paper}>
        <Select
          name="type"
          title="Query Type"
          value={type}
          onChange={setType}
          options={queryType}
        />
      </Paper>
      <Paper variant="outlined" className={classes.paper}>
        <div style={{ display: "flex", width: "100%" }}>
          <Selection
            name="metaModal"
            title="Meta Modal"
            placeholder="meta modal"
            fetchAPI={getMetaModals}
            optionLabelKey="name"
            onChange={(e) => {
              setMetaModals(e);
              setMetaFields([]);
              setRules(defaultRules);
            }}
            value={metaModals}
            classes={{ root: classes.MuiAutocompleteRoot, }}
          />
          <Selection
            name="metaField"
            title="Meta Field"
            placeholder="meta field"
            fetchAPI={() =>
              getMetaFields(fields, metaModals && metaModals.fullName)
            }
            optionLabelKey="name"
            onChange={setMetaFields}
            value={metaFields}
            isMulti={true}
            style={{pointerEvent: 'none'}}
            classes={{ root: classNames(classes.MuiAutocompleteRoot,(!Boolean(metaModals) && classes.disabled)) }}
          />
        </div>
      </Paper>

      {rules
        .filter((e) => e.parentId === -1)
        .map((editor) => {
          return (
            <React.Fragment key={editor.id}>
              <Editor
                onAddGroup={onAddGroup}
                onRemoveGroup={onRemoveGroup}
                onAddRule={onAddRule}
                onRemoveRule={onRemoveRule}
                getChildEditors={getChildEditors}
                getMetaFields={() =>
                  getMetaFields(fields, metaModals && metaModals.fullName)
                }
                onChange={(e, editor, index) => onChange(e, editor, index)}
                editor={editor}
                isDisable={!Boolean(metaModals)}
              />
              <br />
            </React.Fragment>
          );
        })}

      <Button
        title="Generate Query"
        onClick={() => setQuery(generateQuery())}
      />
      <InputLabel color="secondary">{query}</InputLabel>
    </div>
  );
}

export default QueryBuilder;
