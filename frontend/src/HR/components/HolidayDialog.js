import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box
} from '@mui/material';

const HolidayDialog = ({ 
  open, 
  onClose, 
  holidayForm, 
  setHolidayForm, 
  onSubmit, 
  departments = [] 
}) => {
  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setHolidayForm({
      ...holidayForm,
      departments: typeof value === 'string' ? value.split(',') : value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Holiday</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Holiday Name"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({...holidayForm, name: e.target.value})}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Holiday Type</InputLabel>
              <Select
                value={holidayForm.holiday_type}
                onChange={(e) => setHolidayForm({...holidayForm, holiday_type: e.target.value})}
              >
                <MenuItem value="company">Company Holiday</MenuItem>
                <MenuItem value="national">National Holiday</MenuItem>
                <MenuItem value="religious">Religious Holiday</MenuItem>
                <MenuItem value="cultural">Cultural Holiday</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({...holidayForm, date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({...holidayForm, description: e.target.value})}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={holidayForm.is_recurring}
                  onChange={(e) => setHolidayForm({...holidayForm, is_recurring: e.target.checked})}
                />
              }
              label="Recurring Holiday"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={holidayForm.is_work_day}
                  onChange={(e) => setHolidayForm({...holidayForm, is_work_day: e.target.checked})}
                />
              }
              label="Work Day (Not a day off)"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target Departments</InputLabel>
              <Select
                multiple
                value={holidayForm.departments}
                onChange={handleDepartmentChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const dept = departments.find(d => d.id === value);
                      return (
                        <Chip key={value} label={dept?.name || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Create Holiday</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HolidayDialog;
