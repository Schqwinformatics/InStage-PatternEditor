import * as React from 'react';
import './App.css';
import VisualEditor from './components/visualEditor/visualEditor';
import TextualEditor from './components/textualEditor/textualEditor';
import { Switch, Route, RouteProps, RouteComponentProps, BrowserRouter } from 'react-router-dom';
import { Context } from './shared/context';
import { GraphNode } from './shared/models';
import { Grid } from '@material-ui/core';

export interface Props {
  name: string;
  enthusiasmLevel?: number;
}

class App extends React.Component {
  public render(): JSX.Element  {
    let emptyContext: Context = new Context();
    return (
      <BrowserRouter>
        <div className="App">

          <Grid container={true} spacing={16} style={{marginLeft: -24, paddingLeft: 32, marginRight: 0, height: '100%'}}>
            <Grid item={true} xs={7} style={{ height: 'calc(100% - 250px)'}}>
              <Switch>
                  <Route
                    exact={true}
                    path='/'
                    component={
                      () => {
                      return <VisualEditor
                                context={emptyContext}
                      />;
                      }
                    }
                  />
                  <Route
                    path='/:pattern'
                    component={(props: RouteComponentProps<{pattern: string}>) => {
                      return  <VisualEditor
                                context={Context.fromEncodedUrl(props.match.params.pattern)}
                              />;
                    }}
                  />
              </Switch>
            </Grid>
            <Grid item={true} xs={5}  style={{ height: 'calc(100% - 100px)'}}>
              <Route
                path='/'
                component={
                  () => {
                    return <TextualEditor
                      text={""}
                    />;
                  }
                }
              />
            </Grid>
          </Grid>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;