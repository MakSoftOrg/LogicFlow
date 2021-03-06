import { Component, Fragment, h } from 'preact';
import { observer, inject } from 'mobx-react';
import { map } from 'lodash-es';
import GraphModel from '../model/GraphModel';
import CanvasOverlay from './overlay/CanvasOverlay';
import ToolOverlay from './overlay/ToolOverlay';
import BackgroundOverlay from './overlay/BackgroundOverlay';
import Grid from './overlay/Grid';
import Tool from '../tool';
import * as Options from '../options';
import EventEmitter from '../event/eventEmitter';
import DnD from './behavior/DnD';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNodeModel from '../model/node/BaseNodeModel';
import SnaplineOverlay from './overlay/SnaplineOverlay';
import SnaplineModel from '../model/SnaplineModel';
import OutlineOverlay from './overlay/OutlineOverlay';
import BezierAdjustOverlay from './overlay/BezierAdjustOverlay';

type IProps = {
  getView: (type: string) => typeof Component,
  tool: Tool,
  options: Options.Definition,
  eventCenter: EventEmitter
  dnd: DnD,
  snaplineModel: SnaplineModel;
  components: any;
};
type InjectedProps = IProps & {
  graphModel: GraphModel,
};

type ContainerStyle = {
  width?: string;
  height?: string;
};

@inject('graphModel')
@observer
class Graph extends Component<IProps> {
  get InjectedProps() {
    return this.props as InjectedProps;
  }
  getComponent(model: BaseEdgeModel | BaseNodeModel, graphModel: GraphModel, eventCenter: EventEmitter, overlay = 'canvas-overlay') {
    const { getView } = this.props;
    const View = getView(model.type);
    return (
      <View
        key={model.id}
        model={model}
        graphModel={graphModel}
        overlay={overlay}
        eventCenter={eventCenter}
      />
    );
  }
  render() {
    const {
      graphModel, tool, options, eventCenter, dnd, snaplineModel,
    } = this.InjectedProps;
    const style: ContainerStyle = {};
    if (options.width) {
      style.width = `${options.width}px`;
    }
    if (options.height) {
      style.height = `${options.height}px`;
    }
    const { fakerNode, editConfig } = graphModel;
    const { adjustEdge } = editConfig;

    return (
      <Fragment>
        <div
          className="lf-graph"
          {...dnd.eventMap()}
          style={style}
        >
          <CanvasOverlay
            graphModel={graphModel}
            eventCenter={eventCenter}
          >
            <g className="lf-base">
              {
                map(graphModel.sortElements, (nodeModel) => (
                  this.getComponent(nodeModel, graphModel, eventCenter)
                ))
              }
            </g>
            {
              fakerNode ? this.getComponent(fakerNode, graphModel, eventCenter) : ''
            }
            {adjustEdge ? <BezierAdjustOverlay graphModel={graphModel} /> : ''}
            <OutlineOverlay graphModel={graphModel} />
            {!options.isSilentMode && options.snapline !== false ? <SnaplineOverlay snaplineModel={snaplineModel} /> : ''}
          </CanvasOverlay>
          {options.background && <BackgroundOverlay background={options.background} />}
          {options.grid && <Grid {...options.grid} graphModel={graphModel} />}
        </div>
        <ToolOverlay graphModel={graphModel} tool={tool} />
      </Fragment>
    );
  }
}

export default Graph;
