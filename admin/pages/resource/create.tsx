import { Formik, Field, FieldArray, Form } from "formik";
import { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import {
  TextField,
  Select,
  InputLabel,
  FormControl,
  FormGroup,
  MenuItem,
  Button,
  IconButton,
  Container,
  Grid,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
interface Attribute {
  name: string;
  type: string;
  relationType: string;
  model: string;
  inverse: string;
}
interface AttributeError {
  name: Array<string>;
  // type: Array<string>;
  // relationType: Array<string>;
  // model: Array<string>;
}

interface FormErrors {
  resourceName: Array<string>;
  attributes: Array<AttributeError>;
}
interface FormValue {
  resourceName: string;
  attributes: Array<Attribute>;
}
const initialValues: FormValue = {
  resourceName: "",
  attributes: [
    {
      name: "",
      type: "integer",
      relationType: "hasOne",
      model: "",
      inverse: "",
    },
  ],
};

const validate = async (values: FormValue) => {
  let i = 0;
  const errors: FormErrors = {
    resourceName: [],
    attributes: [],
  };
  const resourceNameRule = Yup.string().required("Required");
  const attributeNameRule = (value) =>
    value.type !== "relation"
      ? Yup.string().required("Required")
      : Yup.string().nullable().min(0);

  try {
    await resourceNameRule.validate(values.resourceName);
  } catch (err) {
    // console.log(err.errors);
    errors["resourceName"] = err.errors;
  }

  for (const attribute of values.attributes) {
    // console.log(attribute);
    try {
      await attributeNameRule(attribute).validate(attribute.name);
    } catch (err) {
      // console.log(err);
      errors["attributes"][i] = {
        name: [],
      };
      errors["attributes"][i].name = err.errors;
    }
    i++;
  }
  // console.log(errors);
  return (
    (errors.resourceName.length > 0 || errors.attributes.length > 0) && errors
  );
};

const CreateResource = () => {
  const [models, setModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  useEffect(() => {
    axios.get("http://headless-cms.test/resources").then((response) => {
      setModels(response.data);
      setModelsLoaded(true);
    });
  }, []);
  return (
    modelsLoaded && (
      <Formik
        validate={validate}
        initialValues={initialValues}
        // validationSchema={FormSchema}
        onSubmit={async (values) => {
          try {
            const response = await axios.post(
              "http://headless-cms.test/resource",
              values
            );
          } catch (e) {
            console.log(e);
          }
          console.log(values);
        }}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <Field name="resourceName">
              {({ field, meta }) => (
                <FormControl>
                  <TextField
                    fullWidth
                    {...field}
                    label="Resource Name"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                  ></TextField>
                </FormControl>
              )}
            </Field>

            <FieldArray name="attributes">
              {({ push, remove }) => (
                <>
                  {values.attributes.length > 0 &&
                    values.attributes.map((friend, index) => (
                      <div key={index}>
                        <Field
                          name={`attributes.${index}.type`}
                          className="border-2 border-red-200"
                        >
                          {({ field, meta }) => (
                            <FormControl>
                              <InputLabel
                                id="type-select-label"
                                htmlFor={field.id}
                              >
                                Type
                              </InputLabel>
                              <Select
                                labelId="type-select-label"
                                {...field}
                                // value="integer"
                              >
                                <MenuItem value="integer">Integer</MenuItem>
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="relation">Relation</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        </Field>
                        {values.attributes[index].type === "relation" ? (
                          <>
                            <Field name={`attributes.${index}.relationType`}>
                              {({ field }) => (
                                <FormControl>
                                  <InputLabel
                                    id="relation-type-select-label"
                                    htmlFor={field.id}
                                  >
                                    Relation Type
                                  </InputLabel>
                                  <Select
                                    labelId="relation-type-select-label"
                                    {...field}
                                    defaultValue="hasOne"
                                  >
                                    <MenuItem value="HasOne">HasOne</MenuItem>
                                    <MenuItem value="OneToOne">
                                      Belongs To One(One-to-One)
                                    </MenuItem>
                                    <MenuItem value="ManyToOne">
                                      BelongsToOne(Many-to-One)
                                    </MenuItem>
                                    <MenuItem value="ManyToMany">
                                      ManyToMany
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Field>
                            <Field
                              name={`attributes.${index}.model`}
                              className="border-2 border-red-200"
                            >
                              {({ field }) => (
                                <FormControl>
                                  <InputLabel
                                    id="resource-select-label"
                                    htmlFor={field.id}
                                  >
                                    Resource
                                  </InputLabel>
                                  <Select {...field} defaultValue="person">
                                    {models.map((model) => (
                                      <MenuItem value={model}>{model}</MenuItem>
                                    ))}
                                    ;<MenuItem value="person">person</MenuItem>
                                    <MenuItem value="picture">picture</MenuItem>
                                    <MenuItem value="article">article</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Field>
                          </>
                        ) : (
                          <FormControl>
                            <Field
                              name={`attributes.${index}.name`}
                              className="border-2 border-red-200"
                            >
                              {({ field, meta }) => (
                                <TextField
                                  {...field}
                                  label="Field Name"
                                  error={meta.touched && Boolean(meta.error)}
                                  helperText={meta.touched && meta.error}
                                ></TextField>
                              )}
                            </Field>
                          </FormControl>
                        )}
                        <IconButton
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>
                    ))}
                  <Button
                    type="button"
                    color="secondary"
                    variant="contained"
                    onClick={() =>
                      push({
                        name: "",
                        type: "integer",
                        relationType: "",
                        model: "",
                      })
                    }
                    disableElevation
                  >
                    + Add Field
                  </Button>
                </>
              )}
            </FieldArray>
            <Button
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              type="submit"
              disableElevation
            >
              Create Resource
            </Button>
          </Form>
        )}
      </Formik>
    )
  );
};

export default CreateResource;
