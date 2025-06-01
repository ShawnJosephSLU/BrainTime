import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import type { IQuestion } from './types';
import TailwindQuestionOptions from './TailwindQuestionOptions';
import TailwindMediaUploader from './TailwindMediaUploader';
import TailwindMediaPreviews from './TailwindMediaPreviews';
import RichTextEditor from './RichTextEditor';
import MarkdownPreview from './MarkdownPreview';

interface QuestionFormProps {
  question: IQuestion;
  index: number;
  onQuestionChange: (index: number, field: string, value: any) => void;
  onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
  onCorrectAnswerChange: (questionIndex: number, value: string | string[]) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onRemoveQuestion: (index: number) => void;
  onMediaUploaded: (questionIndex: number, mediaType: string, url: string) => void;
  canRemove: boolean;
}

const questionTypeOptions = [
  { value: 'MCQ', label: 'Multiple Choice (Single Answer)' },
  { value: 'multipleSelect', label: 'Multiple Choice (Multiple Answers)' },
  { value: 'shortAnswer', label: 'Short Answer' },
  { value: 'longAnswer', label: 'Long Answer / Essay' },
  { value: 'trueFalse', label: 'True/False' },
  { value: 'fillInTheBlank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering/Sequencing' }
];

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  index,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  onMediaUploaded,
  canRemove
}) => {
  const [textMode, setTextMode] = useState<'plain' | 'rich' | 'preview'>('plain');

  const handleQuestionTextChange = (value: string) => {
    onQuestionChange(index, 'text', value);
  };

  const handleQuestionTypeChange = (event: any) => {
    onQuestionChange(index, 'type', event.target.value as string);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange(index, 'points', parseInt(e.target.value) || 1);
  };

  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQuestionChange(index, 'timeLimit', value ? parseInt(value) : null);
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange(index, 'explanation', e.target.value);
  };

  const handleOptionChangeLocal = (optionIndex: number, value: string) => {
    onOptionChange(index, optionIndex, value);
  };

  const handleCorrectAnswerChangeLocal = (value: string | string[]) => {
    onCorrectAnswerChange(index, value);
  };

  const handleAddOptionLocal = () => {
    onAddOption(index);
  };

  const handleRemoveOptionLocal = (optionIndex: number) => {
    onRemoveOption(index, optionIndex);
  };

  const handleMediaUploadedLocal = (questionIndex: number, mediaType: string, url: string) => {
    onMediaUploaded(questionIndex, mediaType, url);
  };

  const renderQuestionInput = () => {
    const commonProps = {
      fullWidth: true,
      placeholder: "Enter your question here (supports Markdown formatting)",
    };

    switch (textMode) {
      case 'preview':
        return (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              minHeight: '120px',
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300'
            }}
          >
            <MarkdownPreview content={question.text} />
          </Paper>
        );
      case 'rich':
        return (
          <RichTextEditor
            content={question.text}
            onChange={handleQuestionTextChange}
            placeholder="Enter question text with rich formatting..."
          />
        );
      default:
        return (
          <TextField
            {...commonProps}
            multiline
            rows={4}
            value={question.text}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            required
            variant="outlined"
          />
        );
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`Question ${index + 1}`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {questionTypeOptions.find(opt => opt.value === question.type)?.label || question.type}
          </Typography>
        </Box>
        
        <IconButton
          onClick={() => onRemoveQuestion(index)}
          disabled={!canRemove}
          color="error"
          size="small"
          sx={{ 
            opacity: canRemove ? 1 : 0.3,
            '&:hover': {
              backgroundColor: canRemove ? 'error.light' : 'transparent'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Question Text Section */}
        <Grid component="div" size={{ xs: 12 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Question Text *
              </Typography>
              
              <ToggleButtonGroup
                value={textMode}
                exclusive
                onChange={(_, newMode) => newMode && setTextMode(newMode)}
                size="small"
              >
                <ToggleButton value="plain">
                  <TextFieldsIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Plain
                </ToggleButton>
                <ToggleButton value="rich">
                  <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Rich
                </ToggleButton>
                <ToggleButton value="preview">
                  <PreviewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Preview
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {renderQuestionInput()}
          </Box>
        </Grid>

        {/* Question Settings */}
        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={question.type}
              label="Question Type"
              onChange={handleQuestionTypeChange}
            >
              {questionTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="Points"
            value={question.points}
            onChange={handlePointsChange}
            inputProps={{ min: 1 }}
            required
          />
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="Time Limit (seconds)"
            value={question.timeLimit || ''}
            onChange={handleTimeLimitChange}
            inputProps={{ min: 0 }}
            placeholder="No limit"
            helperText="Leave empty for no time limit"
          />
        </Grid>

        {/* Media Upload Section */}
        <Grid component="div" size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Media Attachments
          </Typography>
          <TailwindMediaUploader 
            questionIndex={index} 
            onMediaUploaded={handleMediaUploadedLocal} 
          />
          <TailwindMediaPreviews question={question} />
        </Grid>

        {/* Answer Options Section */}
        <Grid component="div" size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Answer Options
          </Typography>
          <TailwindQuestionOptions
            question={question}
            onOptionChange={handleOptionChangeLocal}
            onCorrectAnswerChange={handleCorrectAnswerChangeLocal}
            onAddOption={handleAddOptionLocal}
            onRemoveOption={handleRemoveOptionLocal}
          />
        </Grid>

        {/* Explanation Section */}
        <Grid component="div" size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Explanation (Optional)"
            value={question.explanation || ''}
            onChange={handleExplanationChange}
            placeholder="Provide an explanation for the correct answer..."
            variant="outlined"
            helperText="This explanation will be shown to students after they submit their answer"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default QuestionForm;
