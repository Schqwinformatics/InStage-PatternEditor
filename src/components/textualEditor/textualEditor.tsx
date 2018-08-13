import * as React from 'react';
import { connect } from 'react-redux';
import * as vis from 'vis';
import * as actions from './textualEditor.actions';
import { Button, Typography, Paper, TextField, Card, CardContent, Toolbar, Grid, colors } from '@material-ui/core';
import { RootState } from '../shared';
import '../../../../node_modules/vis/dist/vis.css';
import '../../../../node_modules/vis/dist/vis.js';
import { Dispatch } from 'redux';
import { PatternEditorAction } from '../shared/patternEditorAction';
import color from '@material-ui/core/colors/yellow';

interface TextualEditorProps {
    nodes?: vis.Node[];
    edges?: vis.Edge[];
    tryParseCounter?: number;
    currentTextParsed?: boolean;

    text: string;

    updateText?: (text: string) => Promise<void>;
    parse?: (text: string) => Promise<void>;
}

interface TextualEditorState {

}

class TextualEditor extends React.Component<TextualEditorProps, TextualEditorState> {

    private timer: NodeJS.Timer;

    constructor(props: TextualEditorProps) {
        super(props);
    }

    public render(): JSX.Element {

        return (
            <>
            <Typography variant="display1"> Textueller PatternEditor {this.props.tryParseCounter} : {this.props.currentTextParsed}</Typography>
            <Paper style={{height: '70%'}}>
            <Card>
                <CardContent style={{height: '100%'}}>
                    <Typography variant="body1">patternBuilder = new PatternBuilder()</Typography>
                    <TextField
                        placeholder={''}
                        multiline={true}
                        fullWidth={true}
                        rows={40}
                        value={this.props.text}
                        onChange={(e: any) => this.updateText(e.target.value)}
                        disabled={false}
                    />
                    </CardContent>
                </Card>
            </Paper>
            <Paper style={{height: '30%'}}>
                <Card>
                    <CardContent>
                        <Grid container={true} spacing={24}>
                            <Grid item={true} xs={4}>
                                <Grid item={true} xs={12}>
                                    <Button
                                        onClick={() => this.props.parse(this.props.text)}
                                    >
                                        Parse
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Paper>
            </>
        );
    }

    private async updateText(text: string): Promise<void> {
        await this.props.updateText(text);
    }

    private async parse(text: string): Promise<void> {
        await this.props.parse(text);
    }
}

function mapStateToProps(state: RootState): {} | TextualEditorProps {
    return {
        text: state.TextualEditorReducer.text,
        nodes: state.TextualEditorReducer.nodes,
        edges: state.TextualEditorReducer.edges,
        currentTextParsed: state.TextualEditorReducer.currentTextParsed,
        tryParseCounter: state.TextualEditorReducer.tryParseCounter
    };
}

function mapDispatchToProps(dispatch: Dispatch<PatternEditorAction>): {} | TextualEditorProps {
    return {
        updateText: (text: string) => {
            dispatch(actions.updateText(text));
        },
        parse: (text: string) => {
            dispatch(actions.parse(text));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TextualEditor);