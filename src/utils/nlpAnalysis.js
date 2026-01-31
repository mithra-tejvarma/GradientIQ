/**
 * NLP Analysis Utility - Heuristic-based answer evaluation
 * 
 * ⚠️ IMPORTANT: These are probabilistic indicators, NOT definitive judgments
 * This module provides soft signals about answer quality, not absolute verdicts
 */

/**
 * Analyzes concept keyword presence in the answer
 * @param {string} answer - The user's answer text
 * @param {string} concept - The concept being tested
 * @returns {Object} - Analysis result with score and details
 */
export function analyzeConceptKeywords(answer, concept) {
  // Define concept-related keywords for different topics
  const conceptKeywords = {
    'Loops': ['loop', 'for', 'while', 'iteration', 'iterate', 'array', 'index', 'sum', 'counter'],
    'Recursion': ['recursive', 'recursion', 'base case', 'factorial', 'function', 'call', 'return'],
    'Kinematics': ['velocity', 'acceleration', 'distance', 'time', 'motion', 'speed', 'meter', 'second'],
    'Laws of Motion': ['newton', 'force', 'mass', 'acceleration', 'law', 'motion', 'object', 'f=ma'],
    'Atomic Structure': ['atom', 'proton', 'neutron', 'electron', 'nucleus', 'particle', 'charge'],
    'Bonding': ['ionic', 'covalent', 'bond', 'electron', 'share', 'transfer', 'metal', 'non-metal'],
    'Algebra': ['equation', 'solve', 'variable', 'x', 'subtract', 'divide'],
    'Calculus': ['derivative', 'differentiate', 'power rule', 'slope', 'rate', 'function'],
    'World History': ['war', 'cause', 'alliance', 'nationalism', 'imperialism', 'country', 'conflict'],
    'Geography': ['continent', 'africa', 'asia', 'europe', 'america', 'australia', 'antarctica', 'ocean'],
    'Hashing': ['hash', 'function', 'collision', 'security', 'data', 'integrity', 'checksum'],
    'Encryption Basics': ['encryption', 'symmetric', 'asymmetric', 'key', 'cipher', 'decrypt', 'public', 'private'],
    'Cell Biology': ['cell', 'plant', 'animal', 'membrane', 'wall', 'chloroplast', 'vacuole', 'organelle'],
    'Genetics': ['mendel', 'gene', 'allele', 'dominant', 'recessive', 'punnett', 'segregation', 'inheritance']
  };

  const keywords = conceptKeywords[concept] || [];
  const answerLower = answer.toLowerCase();
  
  // Count keyword matches
  const matchedKeywords = keywords.filter(keyword => 
    answerLower.includes(keyword.toLowerCase())
  );
  
  const score = keywords.length > 0 
    ? (matchedKeywords.length / keywords.length) * 100 
    : 50;

  return {
    score: Math.round(score),
    matchedKeywords,
    totalKeywords: keywords.length,
    present: score > 30
  };
}

/**
 * Analyzes logical flow of the answer (intro → explanation → conclusion)
 * @param {string} answer - The user's answer text
 * @returns {Object} - Flow analysis result
 */
export function analyzeLogicalFlow(answer) {
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 2) {
    return {
      score: 20,
      hasIntro: false,
      hasExplanation: false,
      hasConclusion: false,
      structured: false
    };
  }

  // Heuristic: Check for intro indicators
  const introIndicators = ['first', 'begin', 'start', 'introduction', 'let us', 'consider', 'we can'];
  const hasIntro = introIndicators.some(indicator => 
    sentences[0].toLowerCase().includes(indicator)
  ) || sentences.length >= 3;

  // Heuristic: Check for explanation (middle content with technical terms)
  const explanationIndicators = ['because', 'therefore', 'thus', 'since', 'as', 'when', 'which', 'that'];
  const hasExplanation = sentences.slice(1, -1).some(sentence =>
    explanationIndicators.some(indicator => sentence.toLowerCase().includes(indicator))
  ) || sentences.length >= 4;

  // Heuristic: Check for conclusion indicators
  const conclusionIndicators = ['therefore', 'thus', 'hence', 'finally', 'in conclusion', 'result', 'so'];
  const hasConclusion = sentences.length >= 3 && conclusionIndicators.some(indicator => 
    sentences[sentences.length - 1].toLowerCase().includes(indicator)
  );

  const structured = hasIntro || (hasExplanation && sentences.length >= 3);
  
  let score = 40;
  if (hasIntro) score += 20;
  if (hasExplanation) score += 25;
  if (hasConclusion) score += 15;

  return {
    score: Math.min(score, 100),
    hasIntro,
    hasExplanation,
    hasConclusion,
    structured,
    sentenceCount: sentences.length
  };
}

/**
 * Detects repetition patterns in the text
 * @param {string} answer - The user's answer text
 * @returns {Object} - Repetition analysis result
 */
export function analyzeRepetitionPatterns(answer) {
  const words = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words.length < 10) {
    return {
      score: 100,
      repetitionRate: 0,
      hasHighRepetition: false
    };
  }

  // Count word frequencies
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Calculate repetition rate (excluding common words)
  const commonWords = ['that', 'this', 'with', 'from', 'have', 'will', 'would', 'could', 'should', 'about'];
  const significantWords = words.filter(w => !commonWords.includes(w));
  
  const repeatedWords = Object.values(wordFreq).filter(count => count > 2).length;
  const repetitionRate = significantWords.length > 0 
    ? (repeatedWords / significantWords.length) * 100 
    : 0;

  const hasHighRepetition = repetitionRate > 20;
  const score = Math.max(0, 100 - (repetitionRate * 2));

  return {
    score: Math.round(score),
    repetitionRate: Math.round(repetitionRate),
    hasHighRepetition,
    repeatedWordCount: repeatedWords
  };
}

/**
 * Detects sudden large text insertions (possible paste)
 * This is a heuristic indicator, not definitive proof
 * @param {string} answer - The user's answer text
 * @returns {Object} - Paste detection result
 */
export function analyzePastePatterns(answer) {
  const lines = answer.split('\n').filter(line => line.trim().length > 0);
  
  // Heuristic: Very long continuous blocks might indicate paste
  const averageLineLength = answer.length / Math.max(lines.length, 1);
  const hasVeryLongLines = lines.some(line => line.length > 200);
  const hasUniformStructure = lines.length > 5 && 
    lines.every(line => line.length > 50 && line.length < 150);

  // Check for common paste indicators
  const pasteIndicators = [
    answer.length > 500 && lines.length < 3, // Very long continuous text
    hasVeryLongLines && lines.length > 10,    // Many long lines
    hasUniformStructure,                       // Suspiciously uniform
    /https?:\/\//.test(answer),               // Contains URLs
    /\d{4}-\d{2}-\d{2}/.test(answer)          // Contains dates (like copied content)
  ];

  const indicatorCount = pasteIndicators.filter(Boolean).length;
  const possiblePaste = indicatorCount >= 2;

  const score = possiblePaste ? Math.max(30, 100 - (indicatorCount * 20)) : 100;

  return {
    score: Math.round(score),
    possiblePaste,
    averageLineLength: Math.round(averageLineLength),
    indicatorCount,
    confidence: indicatorCount >= 3 ? 'high' : indicatorCount >= 2 ? 'medium' : 'low'
  };
}

/**
 * Generates overall NLP signals based on all analyses
 * @param {string} answer - The user's answer text
 * @param {string} concept - The concept being tested
 * @returns {Object} - Complete NLP analysis with signals
 */
export function generateNLPSignals(answer, concept) {
  if (!answer || answer.trim().length < 10) {
    return {
      signal: 'Insufficient Content',
      confidence: 'high',
      description: 'Answer is too short to analyze meaningfully.',
      details: {
        keywords: { score: 0 },
        flow: { score: 0 },
        repetition: { score: 100 },
        paste: { score: 100 }
      },
      overallScore: 0,
      suggestions: ['Provide a more detailed answer with explanations']
    };
  }

  const keywords = analyzeConceptKeywords(answer, concept);
  const flow = analyzeLogicalFlow(answer);
  const repetition = analyzeRepetitionPatterns(answer);
  const paste = analyzePastePatterns(answer);

  // Calculate weighted overall score
  const overallScore = Math.round(
    (keywords.score * 0.35) +
    (flow.score * 0.30) +
    (repetition.score * 0.20) +
    (paste.score * 0.15)
  );

  // Determine signal based on scores
  let signal, confidence, description;
  const suggestions = [];

  if (overallScore >= 75 && keywords.present && flow.structured) {
    signal = 'Originality Likely';
    confidence = 'high';
    description = 'The answer shows good conceptual understanding with relevant keywords and logical structure.';
  } else if (overallScore >= 55 && overallScore < 75) {
    signal = 'Needs Review';
    confidence = 'medium';
    description = 'The answer has some good elements but could benefit from improvement.';
    
    if (!keywords.present) {
      suggestions.push('Include more concept-specific terminology');
    }
    if (!flow.structured) {
      suggestions.push('Organize your answer with clear introduction and explanation');
    }
  } else {
    signal = 'Low Conceptual Depth';
    confidence = 'medium';
    description = 'The answer may lack sufficient conceptual depth or structure.';
    
    if (!keywords.present) {
      suggestions.push('Use more concept-specific terminology and examples');
    }
    if (!flow.structured) {
      suggestions.push('Structure your answer: intro → explanation → conclusion');
    }
    if (repetition.hasHighRepetition) {
      suggestions.push('Reduce repetition and vary your explanations');
    }
  }

  // Add paste warning if detected
  if (paste.possiblePaste && paste.confidence !== 'low') {
    suggestions.push('Note: Large text blocks detected. Ensure content is in your own words.');
  }

  return {
    signal,
    confidence,
    description,
    details: {
      keywords,
      flow,
      repetition,
      paste
    },
    overallScore,
    suggestions
  };
}
