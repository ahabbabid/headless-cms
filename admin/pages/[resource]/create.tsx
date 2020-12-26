import { useRouter } from "next/router";
// import { useEffect } from "react";

import CloseIcon from "@material-ui/icons/Close";
import { Formik, Field, FieldArray, Form } from "formik";
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
interface modelData {
  tableName: string;
  attributes: object;
  relations: Array<object>;
}
interface formValues {
  attributes: object;
  relationalFields: object;
}
const initialValues = (resourceData: modelData): formValues => {
  let attributes = [];
  let relationalFields = [];
  for (let attribute in resourceData.attributes) {
    attributes[attribute] = "";
  }
  for (let relation of resourceData.relations) {
      relationalFields[relation] = null;
  }
  return {
    attributes,
    relationalFields,
  };
};
import useSWR from "swr";
import axios from "axios";
const fetcher = (url) => axios.get(url).then((res) => res.data);
const Create = () => {
  const router = useRouter();
  const { resource } = router.query;
  const { data, error } = useSWR(
    `http://headless-cms.test/${resource}/schema`,
    fetcher
  );
  if (error) return <div>error</div>;
  if (!data) return <div>loading</div>;
  const resourceData: modelData = data.data;
  console.log(resourceData);
  //   console.log(initialValues(resourceData));
  return (
    <div>
      {resourceData ? (
        <Formik
          validate={null}
          initialValues={initialValues(resourceData)}
          // validationSchema={FormSchema}
          onSubmit={async (values) => {}}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <FieldArray name="attributes">
                {({ push, remove }) => (
                  <>
                    {values.attributes.length > 0 &&
                      values.attributes.map((friend, index) => (
                        <div key={index}>
                          <Field
                            name={`attributes.${index}.name`}
                            className="border-2 border-red-200"
                          >
                            {({ field, meta }) => (
                              <FormControl>
                                <TextField
                                  {...field}
                                  label={values.attributes[index].name}
                                  error={meta.touched && Boolean(meta.error)}
                                  helperText={meta.touched && meta.error}
                                ></TextField>
                              </FormControl>
                            )}
                          </Field>
                        </div>
                      ))}
                  </>
                )}
              </FieldArray>
              <FieldArray name="relationalFields">
                {() => (
                  <>
                    {values.relationalFields.length > 0 &&
                      values.relationalFields.map((friend, index) => (
                        <div key={index}>
                          <Field
                            name={`relationalFields.${index}.name`}
                            className="border-2 border-red-200"
                          >
                            {({ field, meta }) => (
                              <FormControl>
                                {values.relationalFields[index].type ===
                                  "HasMany" ||
                                  values.relationalFields[index].type ===
                                    "ManyToMany" ? <FieldArray name={`relationalFields.${index}`}>

                                    </FieldArray>}
                                <TextField
                                  {...field}
                                  label={values.relationalFields[index].model}
                                  error={meta.touched && Boolean(meta.error)}
                                  helperText={meta.touched && meta.error}
                                ></TextField>
                              </FormControl>
                            )}
                          </Field>
                        </div>
                      ))}
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
      ) : null}
    </div>
  );
};
export default Create;
