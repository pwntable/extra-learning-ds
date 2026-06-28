// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Terminal,
    BookOpen,
    HelpCircle,
    CheckCircle,
    Info,
    Sliders,
    Check,
    X,
    Code,
    Network,
    Layers,
    Award,
    AlertTriangle
} from 'lucide-react';

// The exact program code from BIT 10703 Figure Q2.1
const sourceCodeLines = [
    { text: "#include <stdio.h>", line: 1 },
    { text: "#define SIZE 10", line: 2 },
    { text: "", line: 3 },
    { text: "void myCall1(int myNumber[], int s) {", line: 4 },
    { text: "    int i, j, mIdx;", line: 5 },
    { text: "    int m, temp;", line: 6 },
    { text: "", line: 7 },
    { text: "    for(i=0; i<(s-1); i++)", line: 8, phases: ["OUTER_LOOP_CHECK", "OUTER_LOOP_INC"] },
    { text: "    {", line: 9 },
    { text: "        m = myNumber[i];", line: 10, phases: ["MIN_INIT"] },
    { text: "        mIdx = i;", line: 11, phases: ["MIN_INIT"] },
    { text: "        for(j=i+1; j<s; j++)", line: 12, phases: ["INNER_LOOP_INIT", "INNER_LOOP_CHECK", "INNER_INC"] },
    { text: "        {", line: 13 },
    { text: "            if (myNumber[j]<m)", line: 14, phases: ["COMPARE"] },
    { text: "            {", line: 15 },
    { text: "                m = myNumber[j];", line: 16, phases: ["UPDATE_MIN"] },
    { text: "                mIdx = j;", line: 17, phases: ["UPDATE_MIN"] },
    { text: "            }", line: 18 },
    { text: "        }", line: 19 },
    { text: "", line: 20 },
    { text: "        if (m<myNumber[i])", line: 21, phases: ["SWAP_CHECK"] },
    { text: "        {", line: 22 },
    { text: "            temp = myNumber[i];", line: 23, phases: ["SWAP"] },
    { text: "            myNumber[i] = m;", line: 24, phases: ["SWAP"] },
    { text: "            myNumber[mIdx] = temp;", line: 25, phases: ["SWAP"] },
    { text: "        }", line: 26 },
    { text: "        printf(\"\\nS %d: \", i+1);", line: 27, phases: ["PRINT"] },
    { text: "        myCall2(myNumber, s);", line: 28, phases: ["PRINT"] },
    { text: "    }", line: 29 },
    { text: "}", line: 30 }
];

// Node definitions for both Exam Trees (Feb 2025 vs July 2025)
const treesData = {
    FEB_2025: {
        nodes: [
            { id: '56', x: 250, y: 50, left: '33', right: '69' },
            { id: '33', x: 130, y: 120, left: '25', right: '42' },
            { id: '69', x: 370, y: 120, left: null, right: '88' },
            { id: '25', x: 70, y: 200, left: null, right: null },
            { id: '42', x: 190, y: 200, left: '39', right: '50' },
            { id: '88', x: 430, y: 200, left: '70', right: null },
            { id: '39', x: 140, y: 280, left: null, right: null },
            { id: '50', x: 240, y: 280, left: null, right: null },
            { id: '70', x: 370, y: 280, left: null, right: '80' },
            { id: '80', x: 430, y: 350, left: null, right: null }
        ],
        traversals: {
            PREORDER: ['56', '33', '25', '42', '39', '50', '69', '88', '70', '80'],
            INORDER: ['25', '33', '39', '42', '50', '56', '69', '70', '80', '88'],
            POSTORDER: ['25', '39', '50', '42', '33', '80', '70', '88', '69', '56']
        }
    },
    JULY_2025: {
        nodes: [
            { id: '65', x: 250, y: 50, left: '50', right: '70' },
            { id: '50', x: 130, y: 120, left: '32', right: null },
            { id: '70', x: 370, y: 120, left: '69', right: '90' },
            { id: '32', x: 70, y: 200, left: '20', right: '47' },
            { id: '69', x: 310, y: 200, left: null, right: null },
            { id: '90', x: 430, y: 200, left: '85', right: '98' },
            { id: '20', x: 30, y: 280, left: null, right: null },
            { id: '47', x: 110, y: 280, left: null, right: null },
            { id: '85', x: 370, y: 280, left: null, right: null },
            { id: '98', x: 470, y: 280, left: null, right: null }
        ],
        traversals: {
            PREORDER: ['65', '50', '32', '20', '47', '70', '69', '90', '85', '98'],
            INORDER: ['20', '32', '47', '50', '65', '69', '70', '85', '90', '98'],
            POSTORDER: ['20', '47', '32', '50', '69', '85', '98', '90', '70', '65']
        }
    }
};

export default function App() {
    // Navigation Modules: 
    // 'Q2_SELECTION' (C code + Flowchart)
    // 'Q1_SORT_DUEL' (Bubble vs Selection on Q1 array)
    // 'Q4_BST_TRAVERSAL' (BST Tree traversal with anim)
    const [activeModule, setActiveModule] = useState('Q2_SELECTION');

    // Universal Error Modal state
    const [errorMessage, setErrorMessage] = useState("");

    // --- MODULE 1 STATE (Selection Sort C Walkthrough) ---
    const originalArray = [78, 65, 27, 89, 11, 45, 35, 62, 56, 21];
    const [arrayInput, setArrayInput] = useState("78, 65, 27, 89, 11, 45, 35, 62, 56, 21");
    const [currentArray, setCurrentArray] = useState([...originalArray]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms
    const [traceHistory, setTraceHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('flowchart'); // flowchart, code, trace

    // --- MODULE 2 STATE (Q1 Bubble vs Selection Duel Arena) ---
    const [q1Step, setQ1Step] = useState(0); // 0 to 5 (Passes 0 to 5)
    const [q1IsPlaying, setQ1IsPlaying] = useState(false);
    const [q1SelectedAlgorithm, setQ1SelectedAlgorithm] = useState('bubble');

    // --- MODULE 3 STATE (BST Traversal Visualizer) ---
    const [activeTreePreset, setActiveTreePreset] = useState('FEB_2025'); // FEB_2025, JULY_2025
    const [selectedTraversal, setSelectedTraversal] = useState('PREORDER'); // PREORDER, INORDER, POSTORDER
    const [traversalStep, setTraversalStep] = useState(-1); // -1 is idle, 0+ is current highlighted node index
    const [traversalAnimationHistory, setTraversalAnimationHistory] = useState([]);
    const [treeIsAnimating, setTreeIsAnimating] = useState(false);

    const treeIntervalRef = useRef(null);
    const consoleEndRef = useRef(null);

    // Quiz content for exam preparation (Module 1 Side Quiz)
    const [quizScore, setQuizScore] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});

    const quizQuestions = [
        {
            id: 1,
            q: "What is the specific sorting algorithm implemented by the myCall1() function?",
            options: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Quick Sort"],
            correct: 2,
            explanation: "Selection Sort works by finding the minimum element in the remaining unsorted portion and swapping it with the first unsorted position."
        },
        {
            id: 2,
            q: "What are the roles of myCall1 and myCall2 respectively?",
            options: [
                "myCall1 performs Binary Search, myCall2 prints the results.",
                "myCall1 handles Selection Sort, myCall2 prints the current state of the array.",
                "myCall1 inputs values into the array, myCall2 sorts the array.",
                "myCall1 prints the array, myCall2 implements Bubble Sort."
            ],
            correct: 1,
            explanation: "myCall1 is the primary Selection Sort function. myCall2 is a utility function containing a loop that prints the array contents."
        },
        {
            id: 3,
            q: "After the FIRST complete outer pass (i = 0), what will be the state of the original array?",
            options: [
                "{11, 65, 27, 89, 78, 45, 35, 62, 56, 21}",
                "{11, 21, 27, 35, 45, 56, 62, 65, 78, 89}",
                "{78, 65, 27, 89, 11, 45, 35, 62, 56, 21} (Unchanged)",
                "{21, 65, 27, 89, 11, 45, 35, 62, 56, 78}"
            ],
            correct: 0,
            explanation: "In the first pass (i = 0), the minimum element is 11. It gets swapped with the first element (78). So 11 and 78 swap positions, resulting in {11, 65, ... 78 ...}."
        },
        {
            id: 4,
            q: "Why is the outer loop condition written as i < (s - 1)?",
            options: [
                "To prevent buffer overflow of array memory.",
                "Because once (s - 1) elements are in place, the last element is automatically sorted.",
                "Because the index starts from 1 in C programming.",
                "To make the sorting process run in half the time."
            ],
            correct: 1,
            explanation: "If s - 1 elements are sorted, only one element remains in the unsorted portion, which is guaranteed to be in its correct final sorted position."
        }
    ];

    // --- TRACE GENERATORS ---

    // Generate trace list programmatically for selection sort walkthrough (Module 1)
    const generateTraceList = (arrData) => {
        const list = [];
        const arr = [...arrData];
        const s = arr.length;
        let consoleOutput = ["After calling myCall1:"];

        list.push({
            array: [...arr],
            i: -1,
            j: -1,
            mIdx: -1,
            m: -1,
            phase: "START",
            desc: "Function entry: myCall1 is invoked with size = 10.",
            console: [...consoleOutput],
            swapped: null
        });

        list.push({
            array: [...arr],
            i: 0,
            j: -1,
            mIdx: -1,
            m: -1,
            phase: "OUTER_LOOP_INIT",
            desc: "Outer loop initialized: Setting i = 0.",
            console: [...consoleOutput],
            swapped: null
        });

        for (let i = 0; i < s - 1; i++) {
            list.push({
                array: [...arr],
                i,
                j: -1,
                mIdx: -1,
                m: -1,
                phase: "OUTER_LOOP_CHECK",
                desc: `Check outer loop: Is i (${i}) < s-1 (${s - 1})? Yes, proceed to sorted/unsorted partition split.`,
                console: [...consoleOutput],
                swapped: null
            });

            let m = arr[i];
            let mIdx = i;

            list.push({
                array: [...arr],
                i,
                j: -1,
                mIdx,
                m,
                phase: "MIN_INIT",
                desc: `Assuming current index i (${i}) holds the minimum. Set m = ${m}, mIdx = ${mIdx}.`,
                console: [...consoleOutput],
                swapped: null
            });

            list.push({
                array: [...arr],
                i,
                j: i + 1,
                mIdx,
                m,
                phase: "INNER_LOOP_INIT",
                desc: `Initialize inner loop: j starts at i+1 (${i + 1}) to search unsorted portion.`,
                console: [...consoleOutput],
                swapped: null
            });

            for (let j = i + 1; j < s; j++) {
                list.push({
                    array: [...arr],
                    i,
                    j,
                    mIdx,
                    m,
                    phase: "INNER_LOOP_CHECK",
                    desc: `Check inner loop condition: Is j (${j}) < size (${s})? Yes.`,
                    console: [...consoleOutput],
                    swapped: null
                });

                list.push({
                    array: [...arr],
                    i,
                    j,
                    mIdx,
                    m,
                    phase: "COMPARE",
                    desc: `Compare: Is myNumber[j] (${arr[j]}) < current minimum m (${m})?`,
                    console: [...consoleOutput],
                    swapped: null
                });

                if (arr[j] < m) {
                    m = arr[j];
                    mIdx = j;

                    list.push({
                        array: [...arr],
                        i,
                        j,
                        mIdx,
                        m,
                        phase: "UPDATE_MIN",
                        desc: `Found a smaller value! Update minimum: m = ${m} (at index ${mIdx}).`,
                        console: [...consoleOutput],
                        swapped: null
                    });
                } else {
                    list.push({
                        array: [...arr],
                        i,
                        j,
                        mIdx,
                        m,
                        phase: "INNER_INC",
                        desc: `No change. Incrementing index j.`,
                        console: [...consoleOutput],
                        swapped: null
                    });
                }
            }

            list.push({
                array: [...arr],
                i,
                j: s,
                mIdx,
                m,
                phase: "INNER_LOOP_CHECK",
                desc: `Inner loop finished. All elements from index ${i + 1} to ${s - 1} checked.`,
                console: [...consoleOutput],
                swapped: null
            });

            list.push({
                array: [...arr],
                i,
                j: -1,
                mIdx,
                m,
                phase: "SWAP_CHECK",
                desc: `Check swap requirement: Is min m (${m}) < myNumber[i] (${arr[i]})?`,
                console: [...consoleOutput],
                swapped: null
            });

            if (m < arr[i]) {
                const temp = arr[i];
                arr[i] = m;
                arr[mIdx] = temp;

                list.push({
                    array: [...arr],
                    i,
                    j: -1,
                    mIdx,
                    m,
                    phase: "SWAP",
                    desc: `Yes! Swapping elements myNumber[${i}] (${temp}) and myNumber[${mIdx}] (${m}).`,
                    console: [...consoleOutput],
                    swapped: [i, mIdx]
                });
            } else {
                list.push({
                    array: [...arr],
                    i,
                    j: -1,
                    mIdx,
                    m,
                    phase: "SWAP",
                    desc: `No swap needed as myNumber[i] (${arr[i]}) is already the minimum.`,
                    console: [...consoleOutput],
                    swapped: null
                });
            }

            let printLine = `S ${i + 1}: `;
            for (let k = 0; k < s; k++) {
                printLine += `${arr[k]}  `;
            }
            consoleOutput.push(printLine);

            list.push({
                array: [...arr],
                i,
                j: -1,
                mIdx,
                m,
                phase: "PRINT",
                desc: `Printed the current array pass using myCall2(). Console updated.`,
                console: [...consoleOutput],
                swapped: null
            });

            list.push({
                array: [...arr],
                i: i + 1,
                j: -1,
                mIdx: -1,
                m: -1,
                phase: "OUTER_LOOP_INC",
                desc: `Outer loop index incremented. i is now ${i + 1}.`,
                console: [...consoleOutput],
                swapped: null
            });
        }

        list.push({
            array: [...arr],
            i: s - 1,
            j: -1,
            mIdx: -1,
            m: -1,
            phase: "OUTER_LOOP_CHECK",
            desc: `Check outer loop: Is i (${s - 1}) < s-1 (${s - 1})? No, terminate main loop.`,
            console: [...consoleOutput],
            swapped: null
        });

        list.push({
            array: [...arr],
            i: -1,
            j: -1,
            mIdx: -1,
            m: -1,
            phase: "FINISHED",
            desc: `Selection Sort completed successfully! The array is fully sorted in ascending order.`,
            console: [...consoleOutput],
            swapped: null
        });

        return list;
    };

    const handleApplyCustomArrayCheck = () => {
        try {
            const parsed = arrayInput
                .split(',')
                .map(num => parseInt(num.trim(), 10))
                .filter(num => !isNaN(num));

            if (parsed.length === 10) {
                setCurrentArray(parsed);
                setErrorMessage(""); // clear
            } else {
                setErrorMessage("Please enter exactly 10 valid integers separated by commas.");
            }
        } catch (e) {
            setErrorMessage("Invalid format. Use numbers separated by commas.");
        }
    };

    useEffect(() => {
        const trace = generateTraceList(currentArray);
        setTraceHistory(trace);
        setCurrentStepIdx(0);
        setIsPlaying(false);
    }, [currentArray]);

    // Auto-scrolling terminal console
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentStepIdx]);

    // Auto-play timer for Module 1 Selection Sort
    useEffect(() => {
        let intervalId = null;
        if (isPlaying) {
            intervalId = setInterval(() => {
                setCurrentStepIdx((prev) => {
                    if (prev >= traceHistory.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, playbackSpeed);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPlaying, traceHistory, playbackSpeed]);

    // Safe cleaner hook to cancel pending animations if preset, traversal, or tab is switched
    useEffect(() => {
        if (treeIntervalRef.current) {
            clearInterval(treeIntervalRef.current);
        }
        setTreeIsAnimating(false);
        setTraversalStep(-1);
        setTraversalAnimationHistory([]);
    }, [activeTreePreset, selectedTraversal, activeModule]);

    const handleRunTraversalAnimation = () => {
        if (treeIsAnimating) return;
        setTreeIsAnimating(true);
        setTraversalStep(-1);
        setTraversalAnimationHistory([]);

        const traversalPath = treesData[activeTreePreset].traversals[selectedTraversal];

        let step = 0;
        treeIntervalRef.current = setInterval(() => {
            if (step >= traversalPath.length) {
                clearInterval(treeIntervalRef.current);
                setTreeIsAnimating(false);
                return;
            }

            const nodeToAppend = traversalPath[step];
            setTraversalAnimationHistory(prev => [...prev, nodeToAppend]);
            setTraversalStep(step);
            step++;
        }, 1000);
    };

    // --- CONTROLS IMPLEMENTATION ---
    const handleResetToDefault = () => {
        setCurrentArray([...originalArray]);
        setArrayInput("78, 65, 27, 89, 11, 45, 35, 62, 56, 21");
        setCurrentStepIdx(0);
        setIsPlaying(false);
    };

    const handleStepForward = () => {
        if (currentStepIdx < traceHistory.length - 1) {
            setCurrentStepIdx(prev => prev + 1);
        }
    };

    const handleStepBackward = () => {
        if (currentStepIdx > 0) {
            setCurrentStepIdx(prev => prev - 1);
        }
    };

    // --- CURRENT STEP DEFINITION AND DESTRUCTURING ---
    const currentStep = traceHistory[currentStepIdx] || {
        array: currentArray,
        i: -1,
        j: -1,
        mIdx: -1,
        m: -1,
        phase: "START",
        desc: "Awaiting initialization...",
        console: ["System ready."],
        swapped: null
    };

    const {
        array: stepArray,
        i: activeI,
        j: activeJ,
        mIdx: activeMIdx,
        phase: activePhase,
        desc: stepDescription,
        console: activeConsole
    } = currentStep;

    // --- MODULE 2 LOGIC: Q1 BUBBLE VS SELECTION DUEL ---
    const getQ1ArrayState = (algo, passNum) => {
        const arrayStates = {
            bubble: [
                [22, 5, 67, 98, 45, 32, 101, 99, 73, 10], // Pass 0 (Start)
                [5, 22, 67, 45, 32, 98, 99, 73, 10, 101], // Pass 1
                [5, 22, 45, 32, 67, 98, 73, 10, 99, 101], // Pass 2
                [5, 22, 32, 45, 67, 73, 10, 98, 99, 101], // Pass 3
                [5, 22, 32, 45, 67, 10, 73, 98, 99, 101], // Pass 4
                [5, 22, 32, 45, 10, 67, 73, 98, 99, 101]  // Pass 5
            ],
            selection: [
                [22, 5, 67, 98, 45, 32, 101, 99, 73, 10], // Pass 0 (Start)
                [5, 22, 67, 98, 45, 32, 101, 99, 73, 10], // Pass 1 (Swap 5 and 22)
                [5, 10, 67, 98, 45, 32, 101, 99, 73, 22], // Pass 2 (Swap 10 and 22)
                [5, 10, 22, 98, 45, 32, 101, 99, 73, 67], // Pass 3 (Swap 22 and 67)
                [5, 10, 22, 32, 45, 98, 101, 99, 73, 67], // Pass 4 (Swap 32 and 98)
                [5, 10, 22, 32, 45, 98, 101, 99, 73, 67]  // Pass 5 (No swap needed, 45 is min)
            ]
        };
        return arrayStates[algo][passNum] || arrayStates[algo][0];
    };

    useEffect(() => {
        let timer = null;
        if (q1IsPlaying) {
            timer = setInterval(() => {
                setQ1Step(prev => {
                    if (prev >= 5) {
                        setQ1IsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1500);
        }
        return () => clearInterval(timer);
    }, [q1IsPlaying]);

    // --- MODULE 1 QUIZ HANDLERS ---
    const handleSelectAnswer = (qId, optionIdx) => {
        setQuizAnswers(prev => ({
            ...prev,
            [qId]: optionIdx
        }));
    };

    const handleSubmitQuiz = () => {
        let score = 0;
        quizQuestions.forEach(q => {
            if (quizAnswers[q.id] === q.correct) {
                score++;
            }
        });
        setQuizScore(score);
    };

    const isNodeActive = (phases) => {
        return phases.includes(activePhase);
    };

    const getTraceTableRows = () => {
        const rows = [];
        let prevPass = -1;
        for (let index = 0; index <= currentStepIdx; index++) {
            const step = traceHistory[index];
            if (!step) continue;

            if (step.phase === "PRINT") {
                const passNum = step.i + 1;
                if (passNum !== prevPass) {
                    rows.push({
                        pass: passNum,
                        i: step.i,
                        initialMin: step.array[step.i],
                        finalMin: step.m,
                        minIdx: step.mIdx,
                        arrayState: [...step.array]
                    });
                    prevPass = passNum;
                }
            }
        }
        return rows;
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col font-sans relative overflow-x-hidden">
            {/* Background Ambient Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

            {/* Header Banner - Glassmorphism */}
            <header className="glass sticky top-0 z-50 px-4 py-3 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-2.5 rounded-xl font-extrabold text-lg shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] transition-transform hover:scale-105 cursor-default">
                            UTHM
                        </div>
                        <div>
                            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                                BIT 10703: <span className="text-gradient from-emerald-400 to-sky-400">Data Structure & Algorithms</span>
                            </h1>
                            <p className="text-slate-400 text-[11px] font-mono tracking-widest uppercase mt-0.5 opacity-80">
                                Interactive Exam Study Center • Active Prep Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-full py-1.5 px-4 shadow-inner">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-medium">Engine v2.6 Active</span>
                    </div>
                </div>
            </header>

            {/* Module Selector - Premium Segmented Control */}
            <nav className="relative z-40 py-5 px-4 w-full flex justify-center">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-slate-700/50 shadow-xl">
                    <button
                        onClick={() => setActiveModule('Q2_SELECTION')}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                            activeModule === 'Q2_SELECTION'
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.5)] scale-[1.02]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <Code className="w-4 h-4" />
                        <span>M1: Selection Sort Tracer</span>
                    </button>

                    <button
                        onClick={() => setActiveModule('Q1_SORT_DUEL')}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                            activeModule === 'Q1_SORT_DUEL'
                                ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_4px_20px_-4px_rgba(14,165,233,0.5)] scale-[1.02]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>M2: Sort Duel Arena</span>
                    </button>

                    <button
                        onClick={() => setActiveModule('Q4_BST_TRAVERSAL')}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                            activeModule === 'Q4_BST_TRAVERSAL'
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5)] scale-[1.02]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                    >
                        <Network className="w-4 h-4" />
                        <span>M3: BST Traversal</span>
                    </button>
                </div>
            </nav>

{/* Inline Notification Banner for Client Error Handling */ }
{
    errorMessage && (
        <div className="bg-rose-950/80 border-y border-rose-800 p-3 text-center text-xs text-rose-300 font-mono flex items-center justify-center gap-2" >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{ errorMessage } </span>
                < button onClick = {() => setErrorMessage("")
} className = "ml-4 underline hover:text-white" > Dismiss </button>
    </div>
      )}

    {/* MODULE 1 CONTENT */}
    {activeModule === 'Q2_SELECTION' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Array Visualizer Card */}
                <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-rose-500" />
                    
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 flex items-center gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <Sliders className="w-4 h-4 text-amber-400" />
                            </div>
                            Array State Visualizer
                        </h3>
                        <div className="text-[10px] uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-slate-400 font-mono shadow-inner">
                            Indices: 0 - 9
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-3 px-4 bg-slate-900/40 rounded-xl border border-slate-700/30 p-5 relative shadow-inner">
                        {stepArray.map((val, idx) => {
                            const isSorted = idx < activeI && activeI !== -1;
                            const isActiveI = idx === activeI;
                            const isActiveJ = idx === activeJ;
                            const isMIdx = idx === activeMIdx;

                            let barStyle = "bg-slate-700/80 border-slate-600/50 hover:bg-slate-600/80";
                            let textBadge = "text-slate-400 bg-slate-900/80 border border-slate-700/50";
                            
                            if (isSorted) {
                                barStyle = "bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-400/50 shadow-[0_0_15px_-3px_rgba(52,211,153,0.5)]";
                                textBadge = "text-emerald-100 bg-emerald-900/80 border-emerald-500/30";
                            } else if (isActiveI) {
                                barStyle = "bg-gradient-to-t from-amber-600 to-amber-400 border-amber-400/50 scale-105 z-10 shadow-[0_0_20px_-3px_rgba(251,191,36,0.6)]";
                                textBadge = "text-amber-100 bg-amber-900/80 border-amber-500/30";
                            } else if (isMIdx) {
                                barStyle = "bg-gradient-to-t from-rose-600 to-rose-400 border-rose-400/50 scale-105 z-10 shadow-[0_0_20px_-3px_rgba(244,63,94,0.6)]";
                                textBadge = "text-rose-100 bg-rose-900/80 border-rose-500/30";
                            } else if (isActiveJ) {
                                barStyle = "bg-gradient-to-t from-sky-600 to-sky-400 border-sky-400/50 shadow-[0_0_15px_-3px_rgba(56,189,248,0.5)]";
                                textBadge = "text-sky-100 bg-sky-900/80 border-sky-500/30";
                            }

                            const maxVal = Math.max(...stepArray, 100);
                            const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group/bar cursor-default">
                                    <span className={`text-[11px] font-mono font-bold mb-2 px-2 py-1 rounded-md ${textBadge} transition-all duration-500 z-10 shadow-lg backdrop-blur-sm -translate-y-1 opacity-0 group-hover/bar:opacity-100 group-hover/bar:translate-y-0 absolute top-0`}>
                                        {val}
                                    </span>
                                    <div
                                        className={`w-full ${barStyle} border-t border-l border-r rounded-t-md transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden`}
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                        <span className="text-xs font-mono font-bold select-none text-white/90 drop-shadow-md">
                                            {val}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-center flex flex-col items-center gap-1 min-h-[32px]">
                                        <span className="text-[10px] font-mono text-slate-500 font-bold">[{idx}]</span>
                                        <div className="flex items-center gap-0.5">
                                            {isActiveI && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-amber-950 font-black rounded text-shadow-none">i</span>}
                                            {isActiveJ && <span className="text-[9px] px-1.5 py-0.5 bg-sky-500 text-sky-950 font-black rounded text-shadow-none">j</span>}
                                            {isMIdx && <span className="text-[9px] px-1.5 py-0.5 bg-rose-500 text-white font-black rounded text-shadow-none">min</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
                            <Info className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-200">
                                {stepDescription || "Simulator is ready. Press Play or Step Forward."}
                            </p>
                            {activeI !== -1 && (
                                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-4 py-2.5 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span><span className="text-amber-400 font-bold">i:</span> <span className="text-slate-200">{activeI}</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span><span className="text-sky-400 font-bold">j:</span> <span className="text-slate-200">{activeJ !== -1 ? activeJ : "n/a"}</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span><span className="text-rose-400 font-bold">mIdx:</span> <span className="text-slate-200">{activeMIdx !== -1 ? activeMIdx : "n/a"}</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span><span className="text-emerald-400 font-bold">m(min):</span> <span className="text-slate-200">{currentStep.m !== -1 ? currentStep.m : "n/a"}</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Simulation Panel Controls Card */}
                <div className="glass rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-slate-300 mb-5 uppercase tracking-widest flex items-center gap-3">
                        <div className="p-1.5 bg-sky-500/10 rounded-lg">
                            <Sliders className="w-4 h-4 text-sky-400" />
                        </div>
                        Simulation Controls
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 w-fit">
                            <button
                                onClick={handleStepBackward}
                                disabled={currentStepIdx === 0}
                                className="p-3 rounded-lg bg-slate-800 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-all shadow-sm"
                                title="Step Backward"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 shadow-lg hover:-translate-y-0.5 ${
                                    isPlaying
                                        ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_4px_15px_-3px_rgba(244,63,94,0.5)]"
                                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_15px_-3px_rgba(16,185,129,0.5)]"
                                }`}
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isPlaying ? "Pause Trace" : "Run Program"}
                            </button>
                            <button
                                onClick={handleStepForward}
                                disabled={currentStepIdx === traceHistory.length - 1}
                                className="p-3 rounded-lg bg-slate-800 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-all shadow-sm"
                                title="Step Forward"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="w-px h-8 bg-slate-700 mx-1"></div>
                            <button
                                onClick={handleResetToDefault}
                                className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-sm group"
                                title="Reset Simulator"
                            >
                                <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-2 glass-panel p-4 rounded-xl border-slate-700/50">
                            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                                <span className="uppercase tracking-wider font-bold opacity-80">Playback Speed</span>
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                    {(playbackSpeed / 1000).toFixed(1)}s
                                </span>
                            </div>
                            <input
                                type="range"
                                min="200"
                                max="2500"
                                step="100"
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2 outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-6 pt-6 flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                                Inject Custom Array <span className="text-slate-500 lowercase normal-case">(10 integers, comma separated)</span>
                            </label>
                            <input
                                type="text"
                                value={arrayInput}
                                onChange={(e) => setArrayInput(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
                                placeholder="e.g. 10, 20, 30, 40, 50, 60, 70, 80, 90, 100"
                            />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto shrink-0">
                            <button
                                onClick={handleApplyCustomArrayCheck}
                                className="flex-1 lg:flex-none px-6 py-3 bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold tracking-wide hover:bg-emerald-500/10 hover:border-emerald-500 transition-all"
                            >
                                Inject
                            </button>
                            <button
                                onClick={handleResetToDefault}
                                className="flex-1 lg:flex-none px-6 py-3 bg-slate-900/80 text-slate-400 border border-slate-700 rounded-xl text-xs tracking-wide hover:bg-slate-800 hover:text-slate-200 transition-all"
                            >
                                Reset Default
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
                        <div className="flex border-b border-slate-700/50 bg-slate-900/80">
                            <button
                                onClick={() => setActiveTab('flowchart')}
                                className={`flex-1 py-4 px-4 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 relative group ${activeTab === 'flowchart' ? "text-amber-400 bg-amber-500/5" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
                            >
                                <BookOpen className={`w-4 h-4 transition-colors ${activeTab === 'flowchart' ? "text-amber-500" : "text-slate-500 group-hover:text-amber-400"}`} />
                                Flowchart Logic
                                {activeTab === 'flowchart' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`flex-1 py-4 px-4 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 relative group ${activeTab === 'code' ? "text-sky-400 bg-sky-500/5" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
                            >
                                <Code className={`w-4 h-4 transition-colors ${activeTab === 'code' ? "text-sky-400" : "text-slate-500 group-hover:text-sky-400"}`} />
                                C Code view
                                {activeTab === 'code' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_-2px_10px_rgba(14,165,233,0.5)]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('trace')}
                                className={`flex-1 py-4 px-4 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 relative group ${activeTab === 'trace' ? "text-emerald-400 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
                            >
                                <Terminal className={`w-4 h-4 transition-colors ${activeTab === 'trace' ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"}`} />
                                Console Output
                                {activeTab === 'trace' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_-2px_10px_rgba(16,185,129,0.5)]" />}
                            </button>
                        </div>

                        <div className="p-6 bg-[#0B0F19]/60 min-h-[400px] flex flex-col relative">
                            {activeTab === 'flowchart' && (
                                <div className="flex flex-col h-full justify-between flex-1 animate-fade-in">
                                    <div className="text-xs text-slate-400 mb-4 font-mono flex items-center gap-2 border-b border-slate-700/50 pb-3">
                                        <div className="p-1 bg-amber-500/10 rounded-full">
                                            <Info className="w-3.5 h-3.5 text-amber-500" />
                                        </div>
                                        <span>Active node is highlighted dynamically in orange reflecting the program's code flow.</span>
                                    </div>
                                    <div className="w-full overflow-x-auto glass-panel rounded-xl border-slate-700/50 p-4 flex justify-center shadow-inner">
                                        <svg viewBox="0 0 800 710" className="w-full max-w-[650px] h-auto font-mono text-[10px]" style={{ minWidth: '550px' }}>
                                            <defs>
                                                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
                                                </marker>
                                                <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                                                </marker>
                                            </defs>
                                            <g><rect x="140" y="10" width="120" height="35" rx="17" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["START"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="32" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["START"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>START</text></g>
                                            <path d="M 200 45 L 200 70" fill="none" markerEnd={`url(#${isNodeActive(["START"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["START"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="130" y="70" width="140" height="35" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="91" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>i = 0</text></g>
                                            <path d="M 200 105 L 200 130" fill="none" markerEnd={`url(#${isNodeActive(["OUTER_LOOP_INIT"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><polygon points="200,130 285,160 200,190 115,160" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="163" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>i &lt; (s - 1)?</text></g>
                                            <path d="M 200 190 L 200 215" fill="none" markerEnd={`url(#${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="120" y="215" width="160" height="40" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["MIN_INIT"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="233" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["MIN_INIT"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>m = myNumber[i]</text><text x="200" y="247" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["MIN_INIT"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>mIdx = i</text></g>
                                            <path d="M 200 255 L 200 280" fill="none" markerEnd={`url(#${isNodeActive(["MIN_INIT"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["MIN_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="130" y="280" width="140" height="35" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["INNER_LOOP_INIT"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="301" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["INNER_LOOP_INIT"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>j = i + 1</text></g>
                                            <path d="M 270 297.5 L 360 297.5 L 360 310" fill="none" markerEnd={`url(#${isNodeActive(["INNER_LOOP_INIT"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["INNER_LOOP_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><polygon points="360,310 435,335 360,360 285,335" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="360" y="338" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>j &lt; s?</text></g>
                                            <path d="M 360 360 L 360 390" fill="none" markerEnd={`url(#${isNodeActive(["INNER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><polygon points="360,390 455,420 360,450 265,420" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="360" y="423" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["COMPARE"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>myNumber[j] &lt; m?</text></g>
                                            <path d="M 455 420 L 510 420" fill="none" markerEnd={`url(#${isNodeActive(["COMPARE"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="510" y="400" width="150" height="40" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["UPDATE_MIN"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="585" y="418" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["UPDATE_MIN"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>m = myNumber[j]</text><text x="585" y="432" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["UPDATE_MIN"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>mIdx = j</text></g>
                                            <path d="M 585 400 L 585 355" fill="none" markerEnd={`url(#${isNodeActive(["UPDATE_MIN"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["UPDATE_MIN"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="540" y="320" width="90" height="35" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["INNER_INC"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="585" y="341" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["INNER_INC"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>j++</text></g>
                                            <path d="M 540 337.5 L 445 337.5" fill="none" markerEnd={`url(#${isNodeActive(["INNER_INC"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["INNER_INC"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <path d="M 360 450 L 360 475 L 585 475 L 585 355" fill="none" className={`stroke-2 transition-all ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><polygon points="200,470 285,500 200,530 115,500" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="503" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["SWAP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>m &lt; myNumber[i]?</text></g>
                                            <path d="M 285 335 L 250 335 L 250 455 L 200 455 L 200 470" fill="none" markerEnd={`url(#${isNodeActive(["INNER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="110" y="550" width="180" height="45" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["SWAP"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="200" y="567" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["SWAP"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>temp = myNumber[i];</text><text x="200" y="583" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["SWAP"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>myNumber[i]=m; myNumber[mIdx] = temp;</text></g>
                                            <path d="M 200 530 L 200 550" fill="none" markerEnd={`url(#${isNodeActive(["SWAP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><polygon points="120,620 290,620 270,660 100,660" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["PRINT"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="195" y="644" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["PRINT"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>Call myCall2() to print array</text></g>
                                            <path d="M 200 595 L 200 620" fill="none" markerEnd={`url(#${isNodeActive(["SWAP"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["SWAP"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <path d="M 115 500 L 90 500 L 90 635 L 100 635" fill="none" markerEnd={`url(#${isNodeActive(["SWAP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="15" y="380" width="60" height="35" rx="6" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["OUTER_LOOP_INC"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="45" y="401" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["OUTER_LOOP_INC"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>i++</text></g>
                                            <path d="M 100 640 L 45 640 L 45 415" fill="none" markerEnd={`url(#${isNodeActive(["PRINT"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["PRINT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <path d="M 45 380 L 45 160 L 115 160" fill="none" markerEnd={`url(#${isNodeActive(["OUTER_LOOP_INC"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["OUTER_LOOP_INC"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                            <g><rect x="30" y="100" width="70" height="35" rx="17" className={`fill-slate-900 stroke-2 transition-all duration-300 ${isNodeActive(["FINISHED"]) ? 'stroke-amber-500 fill-amber-950/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-slate-700/80'}`} /><text x="65" y="121" textAnchor="middle" className={`font-bold transition-all ${isNodeActive(["FINISHED"]) ? 'fill-amber-400' : 'fill-slate-400'}`}>END</text></g>
                                            <path d="M 115 160 L 65 160 L 65 135" fill="none" markerEnd={`url(#${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className={`stroke-2 transition-all ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'code' && (
                                <div className="flex-1 flex flex-col font-mono text-[13px] bg-[#0A0D14] border border-slate-700/50 rounded-xl p-4 overflow-y-auto max-h-[400px] shadow-inner animate-fade-in">
                                    <div className="text-slate-500 mb-4 border-b border-slate-800 pb-3 flex justify-between items-center sticky top-0 bg-[#0A0D14] z-10">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4" />
                                            <span>Figure Q2.1 - C Implementation</span>
                                        </div>
                                        <span className="text-[10px] text-sky-400 font-sans tracking-widest uppercase bg-sky-500/10 px-2 py-1 rounded">Syntax Highlighted</span>
                                    </div>
                                    <div className="pt-2">
                                        {sourceCodeLines.map((codeObj, index) => {
                                            const isHighlighted = codeObj.phases && codeObj.phases.includes(activePhase);
                                            // Apply simple syntax coloring for C keywords
                                            let highlightedText = codeObj.text
                                                .replace(/(int|void|if|for)/g, '<span class="text-sky-400">$1</span>')
                                                .replace(/(#include|#define)/g, '<span class="text-rose-400">$1</span>')
                                                .replace(/(printf)/g, '<span class="text-emerald-400">$1</span>')
                                                .replace(/(&lt;|&gt;|==|=|\+|-|\*|\/)/g, '<span class="text-amber-300">$1</span>')
                                                .replace(/(".*?")/g, '<span class="text-amber-200">$1</span>')
                                                .replace(/([0-9]+)/g, '<span class="text-purple-400">$1</span>');

                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex py-0.5 leading-6 transition-all duration-300 rounded ${
                                                        isHighlighted ? "bg-sky-500/10 border-l-4 border-sky-400 pl-3 shadow-[inset_0_1px_3px_rgba(14,165,233,0.1)]" : "text-slate-300 border-l-4 border-transparent hover:bg-slate-800/30 pl-3"
                                                    }`}
                                                >
                                                    <span className="w-10 text-slate-600 select-none text-right pr-4 font-bold border-r border-slate-800 mr-4 opacity-70">{codeObj.line}</span>
                                                    <pre className="whitespace-pre-wrap flex-1" dangerouslySetInnerHTML={{ __html: highlightedText }}></pre>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'trace' && (
                                <div className="flex-1 flex flex-col h-full animate-fade-in">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-t-xl border-b-0 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-slate-400 ml-2">stdout (C Console)</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#0A0D14] rounded-b-xl border border-slate-700/50 p-5 font-mono text-xs text-emerald-400 flex-1 min-h-[300px] max-h-[400px] overflow-y-auto shadow-inner flex flex-col gap-2">
                                        {activeConsole.length === 0 && (
                                            <div className="text-slate-600 italic">Waiting for program execution...</div>
                                        )}
                                        {activeConsole.map((line, idx) => (
                                            <div key={idx} className={`transition-all duration-500 ${idx === activeConsole.length - 1 ? 'text-emerald-300 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] translate-x-2' : 'opacity-80'}`}>
                                                <span className="text-slate-600 mr-3">❯</span>{line}
                                            </div>
                                        ))}
                                        <div ref={consoleEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                        
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                    <BookOpen className="w-4 h-4 text-emerald-400" />
                                </div>
                                Exam Trace Table Generator
                            </h3>
                        </div>
                        
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                            Your exam requires tracing how arrays change. The table below compiles dynamically. <span className="text-emerald-400 font-medium">Scroll horizontally if needed.</span>
                        </p>
                        
                        <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/60 max-h-[350px] shadow-inner custom-scrollbar">
                            <table className="w-full text-left font-mono text-xs border-collapse">
                                <thead className="sticky top-0 bg-slate-900 z-10 border-b border-slate-700/50 shadow-sm">
                                    <tr className="text-slate-400">
                                        <th className="p-3 border-r border-slate-700/50 text-center font-semibold">Pass</th>
                                        <th className="p-3 border-r border-slate-700/50 text-center font-semibold">i</th>
                                        <th className="p-3 border-r border-slate-700/50 text-center font-semibold text-sky-400/80">Init Min</th>
                                        <th className="p-3 border-r border-slate-700/50 text-center font-semibold text-rose-400/80">Final Min</th>
                                        <th className="p-3 border-r border-slate-700/50 text-center font-semibold text-rose-400/80">mIdx</th>
                                        <th className="p-3 font-semibold text-center">Array After Pass</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getTraceTableRows().map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/60 transition-all duration-300 even:bg-slate-900/40">
                                            <td className="p-3 border-r border-slate-700/50 text-center">
                                                <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                                                    S{row.pass}
                                                </span>
                                            </td>
                                            <td className="p-3 border-r border-slate-700/50 text-center font-bold text-slate-300">{row.i}</td>
                                            <td className="p-3 border-r border-slate-700/50 text-center text-slate-400">{row.initialMin}</td>
                                            <td className="p-3 border-r border-slate-700/50 text-center text-rose-400 font-bold">{row.finalMin}</td>
                                            <td className="p-3 border-r border-slate-700/50 text-center text-slate-400">{row.minIdx}</td>
                                            <td className="p-3 text-[11px] text-emerald-300/90 tracking-widest text-center">{row.arrayState.join(' ')}</td>
                                        </tr>
                                    ))}
                                    {getTraceTableRows().length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-10 text-center text-slate-500 italic bg-slate-900/20">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Play className="w-6 h-6 text-slate-600 mb-2 opacity-50" />
                                                    No passes completed yet. Press Play to build trace.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-amber-500" />
                            </div>
                            Lecturer Guidelines: "Deep Learning" Notes
                        </h3>
                        <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-300">
                            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 shadow-inner">
                                <p className="font-bold text-amber-400 mb-2 text-sm flex items-center gap-2">
                                    <span className="text-lg">💡</span> Selection Sort vs Bubble Sort comparison
                                </p>
                                <p className="text-slate-400/90 text-[13px] leading-relaxed">
                                    Unlike Bubble Sort which swaps elements adjacent to one another continuously, Selection Sort finds the absolute minimum first, then executes only a single swap per pass.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-indigo-500" />
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 flex items-center gap-3">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                    <HelpCircle className="w-4 h-4 text-purple-400" />
                                </div>
                                Exam Prep Quick Check
                            </h3>
                            {quizScore !== null && (
                                <span className="text-xs bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/50 text-slate-400">
                                    Score: <strong className="text-purple-400">{quizScore}/{quizQuestions.length}</strong>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {quizQuestions.map((question) => {
                                const selectedAns = quizAnswers[question.id];
                                const showResults = quizScore !== null;
                                const isCorrect = selectedAns === question.correct;

                                return (
                                    <div key={question.id} className="border-b border-slate-700/50 pb-5 last:border-b-0">
                                        <p className="text-[13px] font-bold text-slate-200 mb-3 leading-relaxed">
                                            <span className="text-purple-400 font-mono mr-2">Q{question.id}.</span> {question.q}
                                        </p>
                                        <div className="flex flex-col gap-2.5">
                                            {question.options.map((opt, optIdx) => {
                                                let btnStyle = "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200";
                                                let indicatorStyle = "bg-slate-950 border-slate-700 text-slate-500";
                                                
                                                if (selectedAns === optIdx) {
                                                    btnStyle = "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
                                                    indicatorStyle = "bg-purple-500 text-white border-purple-400";
                                                }
                                                
                                                if (showResults) {
                                                    if (optIdx === question.correct) {
                                                        btnStyle = "bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                                                        indicatorStyle = "bg-emerald-500 text-white border-emerald-400";
                                                    } else if (selectedAns === optIdx && !isCorrect) {
                                                        btnStyle = "bg-rose-500/15 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
                                                        indicatorStyle = "bg-rose-500 text-white border-rose-400";
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        disabled={showResults}
                                                        onClick={() => handleSelectAnswer(question.id, optIdx)}
                                                        className={`w-full text-left p-3 rounded-xl border text-[13px] transition-all duration-300 flex items-start gap-3 group ${btnStyle}`}
                                                    >
                                                        <span className={`font-mono w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[11px] transition-colors duration-300 ${indicatorStyle}`}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span className="mt-0.5 leading-snug">{opt}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {showResults && (
                                            <div className="mt-4 p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50 text-[12px] leading-relaxed shadow-inner animate-fade-in relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <div className="flex gap-2">
                                                    <span className="mt-0.5">{isCorrect ? '✅' : '❌'}</span>
                                                    <p className="text-slate-300/90 italic">{question.explanation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-slate-700/50 mt-5 pt-5">
                            {quizScore === null ? (
                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white disabled:opacity-40 disabled:grayscale font-bold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                >
                                    Submit Quiz Answers
                                </button>
                            ) : (
                                <div className="w-full flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                                            quizScore === quizQuestions.length ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-purple-500/20 border-purple-500 text-purple-400'
                                        }`}>
                                            {quizScore}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Final Score</span>
                                            <span className="text-sm text-slate-200 font-medium">Out of {quizQuestions.length} questions</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { setQuizScore(null); setQuizAnswers({}); }} 
                                        className="text-xs font-bold uppercase tracking-widest bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        )}

        {/* MODULE 2 CONTENT */}
        {activeModule === 'Q1_SORT_DUEL' && (
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" >
            <div className="lg:col-span-7 flex flex-col gap-6" >
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Q1 Sort Duel Arena
                            </h3>
                            <p className="text-slate-400 text-xs font-mono mt-1">
                                Array: <span className="text-amber-400 px-1 bg-amber-500/10 rounded">[22, 5, 67, 98, 45, 32, 101, 99, 73, 10]</span>
                            </p>
                        </div>
                        <div className="flex bg-[#0A0D14] border border-slate-700/50 rounded-xl p-1.5 shadow-inner">
                            <button 
                                onClick={() => { setQ1SelectedAlgorithm('bubble'); setQ1Step(0); }} 
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${q1SelectedAlgorithm === 'bubble' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                            >
                                Bubble Sort
                            </button>
                            <button 
                                onClick={() => { setQ1SelectedAlgorithm('selection'); setQ1Step(0); }} 
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${q1SelectedAlgorithm === 'selection' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                            >
                                Selection Sort
                            </button>
                        </div>
                    </div>

                    <div className="h-60 flex items-end justify-between gap-2 bg-[#0A0D14]/80 p-5 border border-slate-700/50 rounded-xl mb-6 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-[size:16px_16px]" />
                        {getQ1ArrayState(q1SelectedAlgorithm, q1Step).map((val, idx) => {
                            const maxVal = 101;
                            const heightPercent = (val / maxVal) * 100;
                            let barStyle = "bg-slate-800/80 border-slate-700";
                            
                            if (q1SelectedAlgorithm === 'bubble') {
                                if (idx >= 10 - q1Step) barStyle = "bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                            } else {
                                if (idx < q1Step) barStyle = "bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                            }
                            
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative z-10">
                                    <span className="text-[10px] font-mono text-slate-400 font-bold mb-1.5 opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-6 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                                        {val}
                                    </span>
                                    <div 
                                        className={`w-full max-w-[40px] ${barStyle} border-t-2 rounded-t-sm transition-all duration-700 ease-out flex items-center justify-center relative overflow-hidden`} 
                                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
                                        <span className="text-xs font-mono font-bold text-shadow hidden sm:inline text-white/90 drop-shadow-md relative z-10">
                                            {val}
                                        </span>
                                    </div>
                                    <span className="mt-2 text-[9px] font-mono text-slate-500">[{idx}]</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button 
                                disabled={q1Step === 0} 
                                onClick={() => setQ1Step(p => p - 1)} 
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 border border-slate-700 transition-all duration-300"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                Step: <strong className="text-amber-400 font-bold text-sm ml-1">Pass {q1Step}</strong> / 5
                            </span>
                            <button 
                                disabled={q1Step === 5} 
                                onClick={() => setQ1Step(p => p + 1)} 
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 border border-slate-700 transition-all duration-300"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setQ1IsPlaying(!q1IsPlaying)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${q1IsPlaying ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'}`}
                        >
                            {q1IsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} 
                            {q1IsPlaying ? "Stop Auto" : "Auto Play Passes"}
                        </button>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-blue-500" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-2 flex items-center gap-3">
                        <div className="p-1.5 bg-sky-500/10 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-sky-400" />
                        </div>
                        Step Trace Cheat-Sheet for Q1(a) & (b)
                    </h3>
                    <p className="text-xs text-slate-400/90 leading-relaxed ml-10">
                        Refer to the comparative guides on the right to check exact state elements for bubble and selection sorting passes on the Feb 2025 past papers.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                    
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-3">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <Award className="w-4 h-4 text-emerald-400" />
                        </div>
                        UTM - UTHM Exam Solutions
                    </h3>
                    
                    <div className="flex flex-col gap-8">
                        <div>
                            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                Q1(a) Bubble Sort Traces
                            </h4>
                            <div className="bg-[#0A0D14] rounded-xl border border-slate-700/50 overflow-hidden font-mono text-[11px] shadow-inner">
                                <div className="grid grid-cols-12 bg-slate-900/80 p-3 border-b border-slate-700/50 text-slate-400 font-bold tracking-wider">
                                    <span className="col-span-3 text-center">Pass</span>
                                    <span className="col-span-9 pl-4">Array State</span>
                                </div>
                                {[1, 2, 3, 4, 5].map(p => (
                                    <div key={p} className="grid grid-cols-12 p-3 border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors duration-300 even:bg-slate-900/40">
                                        <span className="col-span-3 text-center text-amber-500 font-bold bg-amber-500/10 rounded py-0.5 mx-2">P{p}</span>
                                        <span className="col-span-9 pl-4 text-slate-300 flex items-center tracking-widest">{getQ1ArrayState('bubble', p).join(' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                Q1(b) Selection Sort Traces
                            </h4>
                            <div className="bg-[#0A0D14] rounded-xl border border-slate-700/50 overflow-hidden font-mono text-[11px] shadow-inner">
                                <div className="grid grid-cols-12 bg-slate-900/80 p-3 border-b border-slate-700/50 text-slate-400 font-bold tracking-wider">
                                    <span className="col-span-3 text-center">Pass</span>
                                    <span className="col-span-9 pl-4">Array State</span>
                                </div>
                                {[1, 2, 3, 4, 5].map(p => (
                                    <div key={p} className="grid grid-cols-12 p-3 border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors duration-300 even:bg-slate-900/40">
                                        <span className="col-span-3 text-center text-sky-400 font-bold bg-sky-500/10 rounded py-0.5 mx-2">P{p}</span>
                                        <span className="col-span-9 pl-4 text-slate-300 flex items-center tracking-widest">{getQ1ArrayState('selection', p).join(' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )}

{/* MODULE 3 CONTENT */}
        {activeModule === 'Q4_BST_TRAVERSAL' && (
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" >
                <div className="lg:col-span-7 flex flex-col gap-6" >
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group" >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" >
                            <div>
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    Interactive BST Traversal
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 ml-9">
                                    Visual pathways for Binary Search Tree exam questions
                                </p>
                            </div>
                            <div className="flex bg-[#0A0D14] border border-slate-700/50 rounded-xl p-1.5 shadow-inner" >
                                <button 
                                    onClick={() => setActiveTreePreset('FEB_2025')} 
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTreePreset === 'FEB_2025' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                                >
                                    Feb 2025 Tree
                                </button>
                                <button 
                                    onClick={() => setActiveTreePreset('JULY_2025')} 
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTreePreset === 'JULY_2025' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                                >
                                    July 2025 Tree
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6 bg-[#0A0D14]/80 p-2.5 rounded-xl border border-slate-700/50 shadow-inner" >
                            {['PREORDER', 'INORDER', 'POSTORDER'].map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => setSelectedTraversal(mode as any)} 
                                    className={`py-2 rounded-lg text-[11px] tracking-widest font-bold uppercase transition-all duration-300 ${selectedTraversal === mode ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="w-full overflow-x-auto glass rounded-xl border border-slate-700/50 p-6 flex justify-center relative overflow-hidden" >
                            <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-[size:24px_24px]" />
                            <svg viewBox="0 0 500 400" className="w-full max-w-[480px] h-auto font-mono text-xs select-none relative z-10" style={{ minWidth: '400px' }}>
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                {treesData[activeTreePreset].nodes.map(node => {
                                    const lChild = node.left ? treesData[activeTreePreset].nodes.find(n => n.id === node.left) : null;
                                    const rChild = node.right ? treesData[activeTreePreset].nodes.find(n => n.id === node.right) : null;
                                    return (
                                        <g key={`lines-${node.id}`}>
                                            {lChild && <line x1={node.x} y1={node.y} x2={lChild.x} y2={lChild.y} className="stroke-slate-700/60 stroke-2" />}
                                            {rChild && <line x1={node.x} y1={node.y} x2={rChild.x} y2={rChild.y} className="stroke-slate-700/60 stroke-2" />}
                                        </g>
                                    );
                                })}
                                {treesData[activeTreePreset].nodes.map(node => {
                                    const isVisited = traversalAnimationHistory.includes(node.id);
                                    const isCurrentlyActive = traversalAnimationHistory[traversalStep] === node.id;
                                    
                                    let circClass = "fill-slate-900 stroke-slate-700/80 stroke-2";
                                    let textClass = "fill-slate-400 font-bold";
                                    let filter = "";
                                    
                                    if (isCurrentlyActive) {
                                        circClass = "fill-amber-500 stroke-amber-400 stroke-2";
                                        textClass = "fill-slate-950 font-black";
                                        filter = "url(#glow)";
                                    } else if (isVisited) {
                                        circClass = "fill-emerald-600/90 stroke-emerald-500 stroke-2";
                                        textClass = "fill-emerald-50 font-bold";
                                    }
                                    
                                    return (
                                        <g key={`node-${node.id}`} className="transition-all duration-500 ease-out" style={{ transformOrigin: `${node.x}px ${node.y}px`, transform: isCurrentlyActive ? 'scale(1.1)' : 'scale(1)' }}>
                                            <circle cx={node.x} cy={node.y} r="20" className={`transition-all duration-500 ${circClass}`} filter={filter} />
                                            <text x={node.x} y={node.y + 4} textAnchor="middle" className={`transition-all duration-500 ${textClass}`}>
                                                {node.id}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 shadow-sm" >
                            <button 
                                onClick={handleRunTraversalAnimation} 
                                disabled={treeIsAnimating} 
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold tracking-widest uppercase text-[11px] rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:grayscale"
                            >
                                {treeIsAnimating ? "Animating..." : `Animate ${selectedTraversal.toLowerCase()}`}
                            </button>
                            <div className="text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                                Preset: <span className="text-amber-400 font-bold ml-1">{activeTreePreset.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in" >
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group" >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-blue-500" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-3">
                            <div className="p-1.5 bg-sky-500/10 rounded-lg">
                                <Award className="w-4 h-4 text-sky-400" />
                            </div>
                            Traversal Path Output
                        </h3>
                        <div className="p-5 bg-[#0A0D14] rounded-xl border border-slate-700/50 min-h-[90px] flex flex-wrap items-center gap-2 font-mono text-sm shadow-inner" >
                            {traversalAnimationHistory.map((node, index) => (
                                <span key={index} className="flex items-center gap-2 animate-fade-in">
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg font-black shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                                        {node}
                                    </span>
                                    {index < traversalAnimationHistory.length - 1 && <span className="text-slate-600 font-bold">→</span>}
                                </span>
                            ))}
                            {traversalAnimationHistory.length === 0 && (
                                <span className="text-slate-500 italic text-[11px] flex items-center gap-2">
                                    <Play className="w-4 h-4 opacity-50" />
                                    Click the animate button to visualize traversal.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden" >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-pink-500" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5 flex items-center gap-3">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <Info className="w-4 h-4 text-purple-400" />
                            </div>
                            Traversal Rules Cheat-Sheet
                        </h3>
                        <div className="flex flex-col gap-4 text-xs text-slate-300" >
                            <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl shadow-inner transition-all hover:bg-slate-900/80" >
                                <div className="flex justify-between font-bold text-amber-400 mb-2 uppercase tracking-widest text-[10px]" >
                                    <span>Preorder Traversal</span>
                                    <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Root → Left → Right</span>
                                </div>
                                <p className="text-slate-400/90 text-[12px] leading-relaxed">
                                    Visits the parent/root node first, then down the left subtree, then the right subtree.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl shadow-inner transition-all hover:bg-slate-900/80" >
                                <div className="flex justify-between font-bold text-emerald-400 mb-2 uppercase tracking-widest text-[10px]" >
                                    <span>Inorder Traversal</span>
                                    <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Left → Root → Right</span>
                                </div>
                                <p className="text-slate-400/90 text-[12px] leading-relaxed">
                                    Visits left child first, then root, then right child. This lists elements in sorted ascending order on BSTs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )}

{/* Footer copyright */ }
<footer className="bg-slate-950 border-t border-slate-800 p-4 mt-auto text-center text-xs text-slate-500 font-mono" >
    <p>© 2026 Universiti Tun Hussein Onn Malaysia(UTHM).All exam questions are educational properties of UTHM.</p>
        </footer>
        </div>
  );
}