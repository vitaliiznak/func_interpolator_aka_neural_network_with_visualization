import { ActivationFunction, NetworkData, MLPConfig } from './types';
import { Layer } from './layer';
import { Value } from './value';

export class MLP {
  layers: Layer[];
  activations: ActivationFunction[];

  constructor(config: MLPConfig) {
    const { inputSize, layers, activations } = config;
    const sizes = [inputSize, ...layers];
    this.activations = activations;
    this.layers = layers.map((size, i) => 
      new Layer(sizes[i], size, activations[i] || 'tanh')
    );
    console.log("Creating MLP with layers:", layers, "and activations:", activations);
    this.layers.forEach((layer, i) => {
      console.log(`Layer ${i}: size ${layer.neurons.length}, activation ${layer.neurons[0].activation}`);
    });
  }

  forward(x: (number | Value)[]): Value | Value[] {
    let out: Value[] = x.map(Value.from);
    for (const layer of this.layers) {
      out = layer.forward(out);
    }
    return out.length === 1 ? out[0] : out;
  }

  parameters(): Value[] {
    return this.layers.flatMap(layer => layer.parameters());
  }

  zeroGrad(): void {
    this.parameters().forEach(p => p.grad = 0); 
  }

  toJSON(): NetworkData {
    return {
      layers: this.layers.map((layer, layerIndex) => ({
        id: `layer_${layerIndex}`,
        neurons: layer.neurons.map((neuron, neuronIndex) => ({
          id: `neuron_${layerIndex}_${neuronIndex}`,
          weights: neuron.w.map(w => w.data),
          bias: neuron.b.data,
          activation: neuron.activation,
          name: neuron.activation // Ensure this line is present
        }))
      }))
    };
  }
}