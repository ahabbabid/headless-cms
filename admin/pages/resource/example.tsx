import { Grid, TextField } from "@material-ui/core";
const Example = () => (
  <Grid container>
    <Grid item xs={12}>
      <form>
        <Grid container>
          <Grid item xs={12}>
            <TextField></TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField></TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField></TextField>
          </Grid>
        </Grid>
      </form>
    </Grid>
  </Grid>
);

export default Example;
