import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button, Typography, Paper, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/surveys';
const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'gps', label: 'GPS' },
  { value: 'photo', label: 'Photo' },
];

export default function SurveyAdmin() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [surveyName, setSurveyName] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('text');
  const [qOptions, setQOptions] = useState('');
  const [qOrder, setQOrder] = useState(0);

  useEffect(() => { fetchSurveys(); }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/surveys/`);
      setSurveys(res.data);
    } catch (e) {}
    setLoading(false);
  };

  const handleOpenDialog = (survey = null) => {
    setEditingSurvey(survey);
    setSurveyName(survey ? survey.name : '');
    setSurveyDesc(survey ? survey.description : '');
    setQuestions(survey ? survey.questions || [] : []);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSurvey(null);
    setSurveyName('');
    setSurveyDesc('');
    setQuestions([]);
  };

  const handleSaveSurvey = async () => {
    let survey;
    if (editingSurvey) {
      survey = await axios.patch(`${API_BASE}/surveys/${editingSurvey.id}/`, {
        name: surveyName, description: surveyDesc
      });
    } else {
      survey = await axios.post(`${API_BASE}/surveys/`, {
        name: surveyName, description: surveyDesc
      });
    }
    // Save questions
    for (const q of questions) {
      if (!q.id) {
        await axios.post(`${API_BASE}/survey-questions/`, {
          survey: survey.data.id,
          text: q.text,
          type: q.type,
          options: q.options,
          order: q.order
        });
      } else {
        await axios.patch(`${API_BASE}/survey-questions/${q.id}/`, {
          text: q.text,
          type: q.type,
          options: q.options,
          order: q.order
        });
      }
    }
    fetchSurveys();
    handleCloseDialog();
  };

  const handleDeleteSurvey = async (survey) => {
    await axios.delete(`${API_BASE}/surveys/${survey.id}/`);
    fetchSurveys();
  };

  // Question dialog handlers
  const handleOpenQDialog = (q = null) => {
    setEditingQuestion(q);
    setQText(q ? q.text : '');
    setQType(q ? q.type : 'text');
    setQOptions(q ? q.options : '');
    setQOrder(q ? q.order : questions.length);
    setQuestionDialog(true);
  };
  const handleCloseQDialog = () => {
    setEditingQuestion(null);
    setQText('');
    setQType('text');
    setQOptions('');
    setQOrder(questions.length);
    setQuestionDialog(false);
  };
  const handleSaveQ = () => {
    const newQ = { ...editingQuestion, text: qText, type: qType, options: qOptions, order: qOrder };
    let newQuestions = [...questions];
    if (editingQuestion) {
      newQuestions = newQuestions.map(q => q === editingQuestion ? newQ : q);
    } else {
      newQuestions.push(newQ);
    }
    setQuestions(newQuestions);
    handleCloseQDialog();
  };
  const handleDeleteQ = (q) => {
    setQuestions(questions.filter(qq => qq !== q));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Survey Admin</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>New Survey</Button>
      <List>
        {surveys.map(survey => (
          <ListItem key={survey.id} secondaryAction={
            <Box>
              <IconButton onClick={() => handleOpenDialog(survey)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDeleteSurvey(survey)}><DeleteIcon /></IconButton>
            </Box>
          }>
            <ListItemText primary={survey.name} secondary={survey.description} />
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSurvey ? 'Edit Survey' : 'New Survey'}</DialogTitle>
        <DialogContent>
          <TextField label="Survey Name" fullWidth sx={{ mb: 2 }} value={surveyName} onChange={e => setSurveyName(e.target.value)} />
          <TextField label="Description" fullWidth sx={{ mb: 2 }} value={surveyDesc} onChange={e => setSurveyDesc(e.target.value)} />
          <Typography variant="subtitle1">Questions</Typography>
          <List>
            {questions.map((q, i) => (
              <ListItem key={i} secondaryAction={
                <Box>
                  <IconButton onClick={() => handleOpenQDialog(q)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteQ(q)}><DeleteIcon /></IconButton>
                </Box>
              }>
                <ListItemText primary={`${q.text} (${q.type})`} secondary={q.type === 'select' ? `Options: ${q.options}` : ''} />
              </ListItem>
            ))}
          </List>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenQDialog()} sx={{ mt: 2 }}>Add Question</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSurvey}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={questionDialog} onClose={handleCloseQDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent>
          <TextField label="Question Text" fullWidth sx={{ mb: 2 }} value={qText} onChange={e => setQText(e.target.value)} />
          <TextField label="Type" select fullWidth sx={{ mb: 2 }} value={qType} onChange={e => setQType(e.target.value)}>
            {QUESTION_TYPES.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
          {qType === 'select' && (
            <TextField label="Options (comma separated)" fullWidth sx={{ mb: 2 }} value={qOptions} onChange={e => setQOptions(e.target.value)} />
          )}
          <TextField label="Order" type="number" fullWidth sx={{ mb: 2 }} value={qOrder} onChange={e => setQOrder(Number(e.target.value))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveQ}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
