import React from 'react';
import {
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  IconButton,
  Button,
  Paper,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { IQuestion } from './types';

interface QuestionOptionsProps {
  question: IQuestion;
  onOptionChange: (optionIndex: number, value: string) => void;
  onCorrectAnswerChange: (value: string | string[]) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  question,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption
}) => {
  if (question.type === 'MCQ') {
    return (
      <Box>
        {question.options?.map((option, oIndex) => (
          <Paper 
            key={oIndex} 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              borderRadius: '8px' 
            }}
          >
            <FormControl>
              <RadioGroup
                value={question.correctAnswer}
                onChange={(e) => onCorrectAnswerChange(e.target.value)}
              >
                <FormControlLabel
                  value={option}
                  control={<Radio size="small" />}
                  label=""
                  disabled={!option.trim()}
                />
              </RadioGroup>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: '60px' }}>
              Correct
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              placeholder={`Option ${oIndex + 1}`}
              value={option}
              onChange={(e) => onOptionChange(oIndex, e.target.value)}
              variant="outlined"
            />
            
            <IconButton
              onClick={() => onRemoveOption(oIndex)}
              disabled={question.options!.length <= 2}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
        
        <Button
          onClick={onAddOption}
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          sx={{ mt: 1, borderRadius: '6px' }}
        >
          Add Option
        </Button>
      </Box>
    );
  }
  
  if (question.type === 'trueFalse') {
    return (
      <Box>
        <FormControl component="fieldset">
          <RadioGroup
            value={question.correctAnswer}
            onChange={(e) => onCorrectAnswerChange(e.target.value)}
            row
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label="True"
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="False"
            />
          </RadioGroup>
        </FormControl>
      </Box>
    );
  }
  
  if (question.type === 'shortAnswer' || question.type === 'longAnswer') {
    return (
      <Box>
        <TextField
          fullWidth
          multiline={question.type === 'longAnswer'}
          rows={question.type === 'longAnswer' ? 3 : 1}
          placeholder="Enter correct answer"
          value={question.correctAnswer as string}
          onChange={(e) => onCorrectAnswerChange(e.target.value)}
          variant="outlined"
        />
      </Box>
    );
  }
  
  return null;
};

export default QuestionOptions; 