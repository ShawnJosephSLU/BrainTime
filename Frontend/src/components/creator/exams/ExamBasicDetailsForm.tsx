import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import type { IExamData } from './types';

interface Group {
  _id: string;
  name: string;
  description: string;
  enrollmentCode: string;
  students: any[];
}

interface ExamBasicDetailsFormProps {
  examData: IExamData;
  onChange: (updatedData: Partial<IExamData>) => void;
}

const ExamBasicDetailsForm: React.FC<ExamBasicDetailsFormProps> = ({ examData, onChange }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // Load creator's groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/groups/creator`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(response.data);
        setGroupsError(null);
      } catch (error: any) {
        console.error('Error fetching groups:', error);
        setGroupsError(error.response?.data?.message || 'Failed to load groups');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

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

  const handleGroupSelectionChange = (event: any) => {
    const value = event.target.value;
    onChange({ selectedGroups: typeof value === 'string' ? value.split(',') : value });
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

          {/* Visibility Setting */}
          <Grid component="div" size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Assessment Visibility
                  </Typography>
                  <Chip 
                    label={examData.isPublic ? 'Public' : 'Private'} 
                    color={examData.isPublic ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose who can discover and access this assessment
                </Typography>

                <RadioGroup
                  value={examData.isPublic ? 'public' : 'private'}
                  onChange={(e) => onChange({ isPublic: e.target.value === 'public' })}
                  sx={{ gap: 2 }}
                >
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                    <FormControlLabel
                      value="private"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">Private Assessment</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Only students you directly assign can access this assessment. Requires the access password.
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                  
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                    <FormControlLabel
                      value="public"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">Public Assessment</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visible on the public homepage. Anyone can discover and take this assessment with the access password.
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Group Assignment */}
          <Grid component="div" size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Assign to Groups
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select which groups should have access to this assessment
                </Typography>

                {groupsError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {groupsError}
                  </Alert>
                )}

                {isLoadingGroups ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading your groups...
                    </Typography>
                  </Box>
                ) : groups.length === 0 ? (
                  <Alert severity="info">
                    No groups found. Create groups first to assign assessments to students.
                  </Alert>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel>Select Groups</InputLabel>
                    <Select
                      multiple
                      value={examData.selectedGroups}
                      onChange={handleGroupSelectionChange}
                      input={<OutlinedInput label="Select Groups" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((groupId) => {
                            const group = groups.find(g => g._id === groupId);
                            return (
                              <Chip
                                key={groupId}
                                label={group?.name || 'Unknown'}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {groups.map((group) => (
                        <MenuItem key={group._id} value={group._id}>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {group.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {group.students.length} students • Code: {group.enrollmentCode}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>
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
