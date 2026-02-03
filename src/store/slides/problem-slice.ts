import { type Problem, initialProblemData } from '@/types/problems';
import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '..';

type ProblemState = Problem | null;
const initialState: ProblemState = initialProblemData;

const ProblemSlice = createSlice({
  name: 'problem',
  initialState,
  reducers: {
    setProblem: (state, action: PayloadAction<Problem>) => action.payload,
  },
});

export const { setProblem } = ProblemSlice.actions;
export const selectProblem = (state: RootState) => state.problem;
export default ProblemSlice.reducer;
