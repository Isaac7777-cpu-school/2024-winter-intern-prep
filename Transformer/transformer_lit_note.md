# Abstract
- BLEU score => a metrics for measuring documents translation
- Did not use RNN nor CNN but solely based on attention mechanism

# Introduction
- First just talks about RNN, LSTM, CNN...
- Note that LSTM is much harder to parallel due to its sequential thing
- Attention was used before for delivering content from encoder to decoder.
- Attention based can be purely parallel

# Background
- Using RNN => Harder to relate distanced information
- Attention can read the whole line at once
- In order to achieve multiple channels output like RNN, they have proposed a Multi-Head Attention mechanism
- Self-attention is also mentioned

# Model Architecture
- Good models are basically encoder-decoder structure 
- Are the connections from encoder to the decoder's multihead is duplicated

## Attention

### Scaled Dot-Product Attention
- What are queries ($Q$), keys($K$) and values($V$)?
  - They are packed queries, keys, and values
  - $Q$ should be row major, and then $QK^T$ is like a dot-product for each element
  - Note that both queries and keys are of dimension $d_k$
  - [An explanation to what are query, key, and values](https://www.linkedin.com/pulse/all-query-key-values-transformer-anjil-adhikari-1vrif/)

### Multi-Head Attention
$$
  \text{MultiHead}(Q,K,V) = \text{Concat(}\text{head}_1, \ldots, \text{head}_\text{h})W^O \\
  \textbf{where } \text{head}_\text{i} = \text{Attention}(QW^Q_i, KW^K_i, VW^V_i)
$$

where the projections are parameter matrices $W^Q_i, W^K_i \in \mathbf{R}^{d_\text{model}\times d_k}$, $W^V_i, \in \mathbf{R}^{d_\text{model}\times d_v}$

Note that $d_\text{model}$ is the dimension of keys, values, and queries (in the original settings).

### Applications of Attention in our Model
- In "encoder-decoder atention" layers, the queries come from the previous decoder layer and the memory keys and values come from the output of the encoder. 
- The encooder contains self-attention layers
- The decoder also contains self-attention layers

## Position-wise Feed-Forward Networks
$$
  \text{FFN}(x) = \text{max}(0, xW_1 + b_1)W_2 + b_2
$$

This is appended to all the outputs of the encoder and decoder attention cel

## Embeddings and Softmax
- The model learns embeddings to convert the input tokens and output tokes to vectors of dimenson $d_{\text{model}}$.
- Also use linear transformation and softmax function to convert the decoder output to predicted next-token probabilities.

## Positional Encoding
- Since the model containes no recurrence and no convolution, in order for the model to make use of the order of the sequence, they have injected some information about the relative or abslte position of the tokens in the sequence. 
- Hence, "positional encodings" are added to the input embeddings at the bottoms of the encoder and decoder stacks.

# Why Self-Attention
- Self-attention mechanism can allow very long distance dependency
- It also requires much less complexity than traditional CNN and RNN

# Training


# Conclusion
- Just Better!