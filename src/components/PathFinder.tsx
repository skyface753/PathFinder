import { dijkstra } from '@/Algorithms/Dijkstra';
import { Component } from 'react';
import { Range } from 'react-range';
import ReactSlider from 'react-slider';

type Props = {};
type State = {
  grid: Node[][];
  isVisualizing: boolean;
  visualizationBeenReset: boolean;
  distributionOfObstacles: number;
};

const START_NODE_ROW = 0;
const START_NODE_COL = 0;
const FINISH_NODE_ROW = 19;
const FINISH_NODE_COL = 49;

export default class PathFinder extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      grid: [],
      isVisualizing: false,
      visualizationBeenReset: false,
      distributionOfObstacles: 0.1,
    };
  }

  /**
   * Randomly generates a grid with obstacles
   */
  generateGrid = () => {
    this.minorResetGrid(this.state.grid);
    const grid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        let newNode = new Node(col, row);
        if (Math.random() < this.state.distributionOfObstacles) {
          newNode.isWall = true;
        }
        if (row === START_NODE_ROW && col === START_NODE_COL)
          newNode.isStart = true;
        if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL)
          newNode.isFinish = true;

        currentRow.push(newNode);
      }
      grid.push(currentRow);
    }
    // console.log(grid);
    this.setState({ grid });
  };

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = this.getStartNode();
    const finishNode = this.getFinishNode();
    this.minorResetGrid(grid);
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = this.orderedShortestPath(finishNode);
    // this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    this.animateShortestPath(nodesInShortestPathOrder);
    console.log(nodesInShortestPathOrder);
    this.setState({ isVisualizing: true });
    this.setState({ visualizationBeenReset: false });
  }

  animateShortestPath(nodesInShortestPathOrder: Node[]) {
    if (nodesInShortestPathOrder[0] !== this.getStartNode()) {
      alert('No path found');
    }

    for (let i = 1; i < nodesInShortestPathOrder.length - 1; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`)!.className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  orderedShortestPath(finishNode: Node) {
    const nodesInShortestPath = [];
    let currentNode = finishNode; //setup initial node as the final node
    while (currentNode !== null) {
      //while current node isn't start node
      nodesInShortestPath.unshift(currentNode); //keep adding current node to front of array
      currentNode = currentNode.previousNode; //update currentNode
    }
    return nodesInShortestPath;
  }

  minorResetGrid(grid: Node[][]) {
    // if (this.state.isVisualizing) return;
    grid.forEach(function (row) {
      for (let i = 0; i < row.length; i++) {
        let node = row[i];
        if (!node.isStart && !node.isFinish && !node.isWall) {
          document.getElementById(`node-${node.row}-${node.col}`)!.className =
            'node';
        }
      }
    });
  }

  getStartNode() {
    const { grid } = this.state;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (grid[row][col].isStart) return grid[row][col];
      }
    }
    throw new Error('No start node found');
  }

  getFinishNode() {
    const { grid } = this.state;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (grid[row][col].isFinish) return grid[row][col];
      }
    }
    throw new Error('No finish node found');
  }

  /**
   * Renders the grid
   */
  render() {
    const { grid } = this.state;
    if (grid.length === 0) {
      this.generateGrid();
      return (
        <div className='bg-white'>
          <button onClick={this.generateGrid}>Generate Grid</button>
        </div>
      );
    } else {
      return (
        <div className='bg-white'>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={this.visualizeDijkstra.bind(this)}
          >
            Visualize Dijkstras Algorithm
          </button>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2'
            onClick={this.generateGrid}
          >
            Generate Grid
          </button>
          {/* Slider to adjust the distribution of obstacles */}
          <Range
            values={[this.state.distributionOfObstacles]}
            onChange={(values) =>
              this.setState({ distributionOfObstacles: values[0] })
            }
            step={0.01}
            min={0.01}
            max={0.3}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ccc',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '16px',

                  width: '16px',
                  borderRadius: '4px',
                  backgroundColor: '#999',
                }}
              />
            )}
          />

          <div>
            {grid.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className='space-y-0 space-x-0 p-0 gap-0'>
                  {row.map((col, colIndex) => {
                    const extraClassName = col.isStart
                      ? 'node-start'
                      : col.isFinish
                      ? 'node-finish'
                      : col.isWall
                      ? 'node-wall'
                      : '';
                    return (
                      <div
                        key={colIndex}
                        id={`node-${rowIndex}-${colIndex}`}
                        className={`node ${extraClassName}`}
                        style={{
                          display: 'inline-block',
                          width: '20px',
                          height: '26px',
                          //   backgroundColor:
                          //     rowIndex === START_NODE_ROW &&
                          //     colIndex === START_NODE_COL
                          //       ? 'green'
                          //       : rowIndex === FINISH_NODE_ROW &&
                          //         colIndex === FINISH_NODE_COL
                          //       ? 'red'
                          //       : col.isWall
                          //       ? 'black'
                          //       : 'white',
                        }}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }
}

export class Node {
  col: number;
  row: number;
  distance: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  previousNode: any;
  f_score: number;
  g_score: number;
  h_score: number;

  constructor(col: number, row: number) {
    this.col = col;
    this.row = row;
    this.distance = Infinity;
    this.isStart = row === START_NODE_ROW && col === START_NODE_COL;
    this.isFinish = row === FINISH_NODE_ROW && col === FINISH_NODE_COL;
    this.isWall = false;
    this.isVisited = false;
    this.previousNode = null;
    this.f_score = Infinity;
    this.g_score = Infinity;
    this.h_score = Infinity;
  }
}
