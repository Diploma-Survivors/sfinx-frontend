import {
  type AnyAction,
  type Reducer,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import your slices
import aiReviewReducer from './slides/ai-review-slice';
import contestReducer from './slides/contest-slice';
import createSolutionReducer from './slides/create-solution-slice';
import problemReducer from './slides/problem-slice';
import workspaceReducer from './slides/workspace-slice';

// 1. Create the configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['workspace', 'aiReview', 'createSolution'],
};

// 2. Combine your reducers into one "App Reducer"
const appReducer = combineReducers({
  contest: contestReducer,
  problem: problemReducer,
  aiReview: aiReviewReducer,
  workspace: workspaceReducer,
  createSolution: createSolutionReducer,
});

// 3. Define the State Type based on the reducers (Before store creation)
type AppState = ReturnType<typeof appReducer>;

// 4. Create the Root Reducer (Wrapper to handle Reset)
const rootReducer: Reducer<AppState, AnyAction> = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    storage.removeItem('persist:root');
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

// 5. Wrap the ROOT reducer (not appReducer) with persist logic
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 6. Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 7. Export the persistor
export const persistor = persistStore(store);

// 8. Export Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
