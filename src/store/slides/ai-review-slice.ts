import { AIService } from '@/services/ai-service';
import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

interface AIReviewState {
  isVisible: boolean;
  customPrompt: string;
  isCustomizing: boolean;
  aiResponse: string | null;
  isLoading: boolean;
  error: string | null;
  cached: boolean;
}

const DEFAULT_PROMPT = '';
const initialState: AIReviewState = {
  isVisible: false,
  customPrompt: DEFAULT_PROMPT,
  isCustomizing: false,
  aiResponse: null,
  isLoading: false,
  error: null,
  cached: false,
};

export const generateAIReview = createAsyncThunk(
  'aiReview/generate',
  async ({
    submissionId,
    customPrompt,
  }: { submissionId: string; customPrompt?: string }) => {
    const response = await AIService.generateReview(submissionId, customPrompt);
    return response;
  }
);

const aiReviewSlice = createSlice({
  name: 'aiReview',
  initialState,
  reducers: {
    toggleVisibility: (state) => {
      state.isVisible = !state.isVisible;
    },
    setCustomPrompt: (state, action: PayloadAction<string>) => {
      state.customPrompt = action.payload;
    },
    setIsCustomizing: (state, action: PayloadAction<boolean>) => {
      state.isCustomizing = action.payload;
    },
    resetPrompt: (state) => {
      state.customPrompt = DEFAULT_PROMPT;
    },
    resetReview: (state) => {
      state.aiResponse = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAIReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.cached = false;
      })
      .addCase(generateAIReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aiResponse = action.payload;
        state.cached = false;
      })
      .addCase(generateAIReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate review';
        state.cached = false;
      });
  },
});

export const {
  toggleVisibility,
  setCustomPrompt,
  setIsCustomizing,
  resetPrompt,
  resetReview,
} = aiReviewSlice.actions;
export default aiReviewSlice.reducer;
