import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { IExamData } from './types';

interface ExamBasicDetailsFormProps {
  examData: IExamData;
  onChange: (updatedData: Partial<IExamData>) => void;
}

const ExamBasicDetailsForm: React.FC<ExamBasicDetailsFormProps> = ({ examData, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number fields
    if (name === 'duration') {
      onChange({ [name]: parseInt(value) || 0 });
    } else {
      onChange({ [name]: value });
    }
  };

  const handleSwitchChange = (name: keyof IExamData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [name]: e.target.checked });
  };

  const handleDateChange = (name: keyof IExamData) => (value: Date | null) => {
    if (value) {
      onChange({ [name]: value });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Assessment Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the basic settings for your assessment including timing, access controls, and behavior options.
        </Typography>

        <Grid container spacing={3}>
          {/* Title */}
          <Grid component="div" size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              label="Assessment Title"
              name="title"
              value={examData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title for your assessment"
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            />
          </Grid>

          {/* Description */}
          <Grid component="div" size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={examData.description}
              onChange={handleInputChange}
              placeholder="Provide instructions and context for students taking this assessment"
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            />
          </Grid>

          {/* Date and Time Settings */}
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <DateTimePicker
              label="Start Time"
              value={examData.startTime}
              onChange={handleDateChange('startTime')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  helperText: "When students can begin taking the assessment"
                }
              }}
            />
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <DateTimePicker
              label="End Time"
              value={examData.endTime}
              onChange={handleDateChange('endTime')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  helperText: "After this time, students cannot start the assessment"
                }
              }}
            />
          </Grid>

          {/* Duration and Password */}
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              type="number"
              label="Duration (minutes)"
              name="duration"
              value={examData.duration}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
              helperText="How long students have to complete the assessment"
              variant="outlined"
            />
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              type="password"
              label="Access Password"
              name="password"
              value={examData.password}
              onChange={handleInputChange}
              placeholder="Students must enter this to access the assessment"
              variant="outlined"
            />
          </Grid>

          {/* Assessment Options */}
          <Grid component="div" size={{ xs: 12 }}>
            <Paper sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Assessment Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure how the assessment behaves for students
              </Typography>

              <Grid container spacing={2}>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={examData.allowInternet}
                        onChange={handleSwitchChange('allowInternet')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Allow Internet</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Students can access external resources
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={examData.autoSubmit}
                        onChange={handleSwitchChange('autoSubmit')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Auto-submit</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically submit when time expires
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={examData.shuffleQuestions}
                        onChange={handleSwitchChange('shuffleQuestions')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Shuffle Questions</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Randomize question order for each student
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={examData.showResults}
                        onChange={handleSwitchChange('showResults')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Show Results</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Display results immediately after completion
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ExamBasicDetailsForm;
