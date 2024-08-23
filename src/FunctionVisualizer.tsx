import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import Plotly from 'plotly.js-dist';
import { store } from './store';
import { getTrueFunction } from './utils/dataGeneration';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { commonStyles, spacing } from './styles/common';
import { css } from '@emotion/css';

const FunctionVisualizer: Component = () => {
  let plotDiv: HTMLDivElement | undefined;
  const [showLearnedFunction, setShowLearnedFunction] = createSignal(true);

  const createPlot = () => {
    if (!plotDiv || !store.trainingData || !store.network) return;

    const { xs, ys } = store.trainingData;

    // Generate points for the true function
    const trueX = Array.from({ length: 100 }, (_, i) => i);
    const trueY = trueX.map(getTrueFunction);

    // Generate points for the learned function
    const learnedY = trueX.map(x => {
      // Assuming store.network.forward accepts a regular number input
      // and returns a regular number output
      const output = store.network.forward([x]);
      return output[0].data;
    });

    console.log(learnedY)

    // Prepare data for the neural network predictions
    const nnX = xs.map(x => x[0]);
    const nnY = ys;

    const data = [
      {
        x: trueX,
        y: trueY,
        type: 'scatter',
        mode: 'lines',
        name: 'True Function',
        line: { color: colors.primary, width: 3 },
        hoverinfo: 'x+y',
      },
      {
        x: nnX,
        y: nnY,
        type: 'scatter',
        mode: 'markers',
        name: 'Training Data',
        marker: { color: colors.error, size: 8 },
        hoverinfo: 'x+y',
      },
      {
        x: trueX,
        y: learnedY,
        type: 'scatter',
        mode: 'lines',
        name: 'Learned Function',
        line: { color: colors.success, width: 3, dash: 'dash' },
        visible: showLearnedFunction() ? true : 'legendonly',
        hoverinfo: 'x+y',
      }
    ];

    const layout = {
      title: 'ChatGPT Productivity Paradox',
      xaxis: { 
        title: 'ChatGPT Usage (%)',
        range: [0, 100],
      },
      yaxis: { 
        title: 'Productivity Score',
        range: [0, 100],
      },
      legend: { 
        x: 1, 
        xanchor: 'right', 
        y: 1,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: colors.border,
        borderwidth: 1,
      },
      hovermode: 'closest',
      plot_bgcolor: colors.background,
      paper_bgcolor: colors.surface,
      font: {
        family: typography.fontFamily,
        size: 14,
        color: colors.text,
      },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToAdd: ['select2d', 'lasso2d'],
      modeBarButtonsToRemove: ['autoScale2d'],
      displaylogo: false,
      scrollZoom: true,
    };

    Plotly.newPlot(plotDiv, data, layout, config);

    // Add event listener for legend clicks
    plotDiv.on('plotly_legendclick', (event) => {
      if (event.curveNumber === 2) { // Learned Function
        setShowLearnedFunction(!showLearnedFunction());
      }
      return false; // Prevent default legend click behavior
    });
  };

  onMount(() => {
    createPlot();
  });

  createEffect(() => {
    if (store.trainingData && store.network) {
      createPlot();
    }
  });

  const styles = {
    container: css`
      ${commonStyles.card}
      padding: ${spacing.xl};
      margin-top: ${spacing.xl};
      background-color: ${colors.surface};
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      
      @media (max-width: 768px) {
        padding: ${spacing.lg};
      }
    `,
    title: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      margin-bottom: ${spacing.lg};
      color: ${colors.text};
    `,
    plotContainer: css`
      width: 100%;
      height: 500px;
      margin-bottom: ${spacing.lg};
    `,
    toggleButton: css`
      ${commonStyles.button}
      ${commonStyles.secondaryButton}
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${spacing.sm};
      width: 100%;
      max-width: 200px;
      margin: 0 auto;
    `,
  };

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>ChatGPT Productivity Function</h2>
      <div ref={plotDiv} class={styles.plotContainer}></div>
      <button class={styles.toggleButton} onClick={() => setShowLearnedFunction(!showLearnedFunction())}>
        {showLearnedFunction() ? 'Hide' : 'Show'} Learned Function
      </button>
    </div>
  );
};

export default FunctionVisualizer;