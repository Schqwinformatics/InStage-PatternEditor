import { combineReducers } from 'redux';
import { VisualEditorState, VisualEditorReducer } from '../visualEditor/visualEditor.reducer';
import { TextualEditorState, TextualEditorReducer } from '../textualEditor/textualEditor.reducer';

export interface RootState {
    VisualEditorReducer: VisualEditorState;
    TextualEditorReducer: TextualEditorState;
}

const RootReducer = combineReducers<RootState>( {
    VisualEditorReducer,
    TextualEditorReducer
});

export default RootReducer;