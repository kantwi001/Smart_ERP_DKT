import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Paper, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { saveSurveys, getSurveys, queueSurveyResponse } from './offline';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/surveys';

export default function Survey() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/surveys/`);
      setSurveys(res.data);
      await saveSurveys(res.data);
    } catch (e) {
      // fallback to offline cache
      const cached = await getSurveys();
      setSurveys(cached);
    }
    setLoading(false);
  };


  const handleOpenSurvey = (survey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setResponseDialog(true);
    setSuccess(false);
  };

  const handleCloseDialog = () => {
    setResponseDialog(false);
    setSelectedSurvey(null);
    setAnswers({});
  };

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setQueued(false);
    try {
      // Try online submission
      const resp = await axios.post(`${API_BASE}/survey-responses/`, {
        survey: selectedSurvey.id
      });
      for (const q of selectedSurvey.questions) {
        const formData = new FormData();
        formData.append('response', resp.data.id);
        formData.append('question', q.id);
        if (q.type === 'text' || q.type === 'select') {
          formData.append('answer_text', answers[q.id] || '');
        } else if (q.type === 'number') {
          formData.append('answer_number', answers[q.id] || '');
        } else if (q.type === 'gps') {
          formData.append('answer_gps', answers[q.id] || '');
        } else if (q.type === 'photo' && answers[q.id]) {
          formData.append('answer_photo', answers[q.id]);
        }
        await axios.post(`${API_BASE}/survey-answers/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setResponseDialog(false);
        setSelectedSurvey(null);
        setAnswers({});
      }, 1000);
    } catch (e) {
      // If offline, queue for sync
      await queueSurveyResponse({
        survey: selectedSurvey,
        answers,
        timestamp: new Date().toISOString()
      });
      setQueued(true);
      setTimeout(() => {
        setResponseDialog(false);
        setSelectedSurvey(null);
        setAnswers({});
      }, 1200);
    }
    setSubmitting(false);
  };


  return (
    <Paper style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>Available Surveys</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {surveys.map((survey) => (
            <ListItem button key={survey.id} onClick={() => handleOpenSurvey(survey)}>
              <ListItemText primary={survey.name} secondary={survey.description} />
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={responseDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Fill Survey: {selectedSurvey?.name}</DialogTitle>
        <DialogContent>
          {selectedSurvey?.questions?.map((q) => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <Typography>{q.text}</Typography>
              {q.type === 'text' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={answers[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                />
              )}
              {q.type === 'number' && (
                <TextField
                  fullWidth
                  type="number"
                  variant="outlined"
                  value={answers[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                />
              )}
              {q.type === 'select' && (
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  SelectProps={{ native: true }}
                  value={answers[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                >
                  <option value=""></option>
                  {(q.options?.split(',') || []).map(opt => (
                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                  ))}
                </TextField>
              )}
              {q.type === 'gps' && (
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        handleChange(q.id, `${pos.coords.latitude},${pos.coords.longitude}`);
                      });
                    }
                  }}
                  disabled={submitting}
                  sx={{ mt: 1 }}
                >
                  {answers[q.id] ? `Location: ${answers[q.id]}` : 'Capture Location'}
                </Button>
              )}
              {q.type === 'photo' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleChange(q.id, e.target.files[0])}
                  disabled={submitting}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          ))} 
          {success && <Typography color="success.main">Submitted!</Typography>}
        {queued && <Alert severity="info">Response saved offline and queued for sync.</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
