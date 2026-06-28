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
        <div className= "min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" >
        {/* Header Banner */ }
        < header className = "bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md" >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4" >
                <div className="flex items-center gap-3" >
                    <div className="bg-amber-500 text-slate-950 p-2.5 rounded-lg font-extrabold text-lg shadow-inner" >
                        UTHM
                        </div>
                        < div >
                        <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2" >
                            BIT 10703: Data Structure and Algorithms
                                </h1>
                                < p className = "text-slate-400 text-xs font-mono" >
                                    Interactive Exam Study Center • Active Prep Portal
                                        </p>
                                        </div>
                                        </div>

                                        < div className = "flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg p-1.5 px-3" >
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" > </span>
                                                < span className = "text-xs font-mono text-slate-300" > UTHM Exam Engine v2.6 </span>
                                                    </div>
                                                    </div>
                                                    </header>

    {/* Module Selector - Master Dashboard with three primary modules */ }
    <nav className="bg-slate-950 border-b border-slate-800/80 p-2.5" >
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2.5" >
            <button
            onClick={ () => setActiveModule('Q2_SELECTION') }
    className = {`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${activeModule === 'Q2_SELECTION'
            ? "bg-amber-500 text-slate-950 shadow-md scale-[1.02]"
            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
        }`
}
          >
    <Code className="w-4 h-4" />
        Module 1: Selection Sort C Tracer(Q2)
            </button>

            < button
onClick = {() => setActiveModule('Q1_SORT_DUEL')}
className = {`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${activeModule === 'Q1_SORT_DUEL'
        ? "bg-amber-500 text-slate-950 shadow-md scale-[1.02]"
        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
    }`}
          >
    <Layers className="w-4 h-4" />
        Module 2: Sort Duel Arena(Q1 Exam)
            </button>

            < button
onClick = {() => setActiveModule('Q4_BST_TRAVERSAL')}
className = {`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${activeModule === 'Q4_BST_TRAVERSAL'
        ? "bg-amber-500 text-slate-950 shadow-md scale-[1.02]"
        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
    }`}
          >
    <Network className="w-4 h-4" />
        Module 3: BST Traversal Engine(Q4 Tree)
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

{/* MODULE 1 CONTENT */ }
{
    activeModule === 'Q2_SELECTION' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" >
            <div className="lg:col-span-7 flex flex-col gap-6" >
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden" >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                        <div className="flex justify-between items-center mb-4" >
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2" >
                                <Sliders className="w-4 h-4 text-amber-500" />
                                    Active Sorting Visualizer(myNumber Array)
                                        </h3>
                                        < div className = "text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300 font-mono" >
                                            Index Range: 0 - 9
                                                </div>
                                                </div>

                                                < div className = "h-56 flex items-end justify-between gap-2.5 px-2 bg-slate-900/50 rounded-lg p-4 border border-slate-800/60 mb-4 relative" >
                                                {
                                                    stepArray.map((val, idx) => {
                                                        const isSorted = idx < activeI && activeI !== -1;
                                                        const isActiveI = idx === activeI;
                                                        const isActiveJ = idx === activeJ;
                                                        const isMIdx = idx === activeMIdx;

                                                        let barColor = "bg-slate-700 border-slate-600";
                                                        let textBadge = "text-slate-400 bg-slate-950/80";

                                                        if (isSorted) {
                                                            barColor = "bg-emerald-600/90 border-emerald-500 text-emerald-100 shadow-[0_0_12px_-3px_rgba(16,185,129,0.4)]";
                                                            textBadge = "text-emerald-300 bg-emerald-950/90";
                                                        } else if (isActiveI) {
                                                            barColor = "bg-amber-500 border-amber-400 text-slate-950 font-bold scale-105 shadow-[0_0_15px_-3px_rgba(245,158,11,0.5)]";
                                                            textBadge = "text-amber-300 bg-slate-950";
                                                        } else if (isMIdx) {
                                                            barColor = "bg-rose-600 border-rose-500 text-white font-bold scale-105 shadow-[0_0_15px_-3px_rgba(244,63,94,0.6)]";
                                                            textBadge = "text-rose-400 bg-slate-950";
                                                        } else if (isActiveJ) {
                                                            barColor = "bg-sky-500 border-sky-400 text-slate-950 font-bold shadow-[0_0_10px_-2px_rgba(14,165,233,0.5)]";
                                                            textBadge = "text-sky-400 bg-slate-950";
                                                        }

                                                        const maxVal = Math.max(...stepArray, 100);
                                                        const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));

                                                        return (
                                                            <div key= { idx } className = "flex-1 flex flex-col items-center h-full justify-end" >
                                                                <span className={ `text-[10px] font-mono font-bold mb-1 px-1.5 py-0.5 rounded ${textBadge} transition-all duration-300 z-10 shadow border border-slate-800` }>
                                                                    { val }
                                                                    </span>
                                                                    < div
                                                        className = {`w-full ${barColor} border-t-2 rounded-t transition-all duration-300 flex items-center justify-center relative overflow-hidden`
                                                    }
                        style = {{ height: `${heightPercent}%` }}
                                                    >
                                                    <span className="text-xs font-mono font-bold select-none text-shadow-sm opacity-90 hidden sm:inline" >
                                                        { val }
                                                        </span>
                                                        </div>
                                                        < div className = "mt-2 text-center flex flex-col items-center gap-0.5" >
                                                            <span className="text-[11px] font-mono text-slate-400 font-bold" > [{ idx }] </span>
                                                                < div className = "h-4 flex items-center" >
                                                                    { isActiveI && <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-slate-950 font-black rounded-sm leading-none" > i </span>
}
{ isActiveJ && <span className="text-[9px] px-1 py-0.2 bg-sky-500 text-slate-950 font-black rounded-sm leading-none" > j </span> }
{ isMIdx && <span className="text-[9px] px-1 py-0.2 bg-rose-600 text-white font-black rounded-sm leading-none" > min </span> }
</div>
    </div>
    </div>
                  );
                })}
</div>

    < div className = "bg-slate-900 border border-slate-800 rounded-lg p-3 px-4 flex items-start gap-3" >
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
            <p className="text-sm font-medium text-slate-200" >
                { stepDescription || "Simulator is ready. Press Play or Step Forward."}
</p>
{
    activeI !== -1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80" >
            <div><span className="text-amber-500 font-bold" > i: </span> {activeI}</div >
                <div><span className="text-sky-400 font-bold" > j: </span> {activeJ !== -1 ? activeJ : "n/a"}</div>
                    < div > <span className="text-rose-400 font-bold" > mIdx: </span> {activeMIdx !== -1 ? activeMIdx : "n/a"}</div>
                        < div > <span className="text-emerald-400 font-bold" > m(min value): </span> {currentStep.m !== -1 ? currentStep.m : "n/a"}</div>
                            </div>
                  )
}
</div>
    </div>
    </div>

    < div className = "bg-slate-950 rounded-xl p-5 border border-slate-850 shadow-xl" >
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2" >
            <Sliders className="w-4 h-4 text-emerald-500" />
                Simulation Panel Controls
                    </h4>
                    < div className = "grid grid-cols-1 md:grid-cols-2 gap-4 items-center" >
                        <div className="flex flex-wrap items-center gap-2" >
                            <button
                    onClick={ handleStepBackward }
disabled = { currentStepIdx === 0}
className = "p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow"
title = "Step Backward"
    >
    <ChevronLeft className="w-5 h-5" />
        </button>
        < button
onClick = {() => setIsPlaying(!isPlaying)}
className = {`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow ${isPlaying
        ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
        : "bg-emerald-600 text-white hover:bg-emerald-500"
    }`}
                  >
    { isPlaying?<Pause className = "w-4 h-4" /> : <Play className="w-4 h-4" />}
{ isPlaying ? "Pause Trace" : "Run Program" }
</button>
    < button
onClick = { handleStepForward }
disabled = { currentStepIdx === traceHistory.length - 1}
className = "p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow"
title = "Step Forward"
    >
    <ChevronRight className="w-5 h-5" />
        </button>
        < button
onClick = { handleResetToDefault }
className = "p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow"
title = "Reset Simulator"
    >
    <RotateCcw className="w-5 h-5" />
        </button>
        </div>
        < div className = "flex flex-col gap-1.5" >
            <div className="flex justify-between text-xs font-mono text-slate-400" >
                <span>Step Interval Rate: </span>
                    < span className = "text-emerald-400 font-bold" > {(playbackSpeed / 1000).toFixed(1)}s </span>
                        </div>
                        < input
type = "range"
min = "200"
max = "2500"
step = "100"
value = { playbackSpeed }
onChange = {(e) => setPlaybackSpeed(Number(e.target.value))}
className = "w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
    />
    </div>
    </div>

    < div className = "border-t border-slate-900 mt-4 pt-4 flex flex-col md:flex-row gap-3 items-end" >
        <div className="flex-1" >
            <label className="block text-xs font-mono text-slate-400 mb-1.5" >
                Analyze Custom 10 - Integer Array(separated by comma):
</label>
    < input
type = "text"
value = { arrayInput }
onChange = {(e) => setArrayInput(e.target.value)}
className = "w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
    />
    </div>
    < div className = "flex gap-2 shrink-0" >
        <button
                    onClick={ handleApplyCustomArrayCheck }
className = "px-4 py-2 bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold hover:bg-emerald-950/40 transition-all"
    >
    Apply Array
        </button>
        < button
onClick = { handleResetToDefault }
className = "px-4 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded text-xs hover:bg-slate-800 transition-all"
    >
    Default
    </button>
    </div>
    </div>
    </div>

    < div className = "bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col" >
        <div className="flex border-b border-slate-800 bg-slate-950" >
            <button
                  onClick={ () => setActiveTab('flowchart') }
className = {`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${activeTab === 'flowchart' ? "border-amber-500 text-white bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"
    }`}
                >
    <BookOpen className="w-4 h-4 text-amber-500" />
        Flowchart Logic
            </button>
            < button
onClick = {() => setActiveTab('code')}
className = {`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${activeTab === 'code' ? "border-amber-500 text-white bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"
    }`}
                >
    <Code className="w-4 h-4 text-sky-400" />
        C Code view
            </button>
            < button
onClick = {() => setActiveTab('trace')}
className = {`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${activeTab === 'trace' ? "border-amber-500 text-white bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"
    }`}
                >
    <Terminal className="w-4 h-4 text-emerald-400" />
        Printf Output Console
            </button>
            </div>

            < div className = "p-4 bg-slate-950 min-h-[300px] flex flex-col" >
                { activeTab === 'flowchart' && (
                    <div className="flex flex-col h-full justify-between flex-1" >
                        <div className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-2 border-b border-slate-900 pb-2" >
                            <Info className="w-3.5 h-3.5 text-amber-500" />
                                <span>Active node is highlighted dynamically in orange reflecting the program's code flow.</span>
                                    </div>
                                    < div className = "w-full overflow-x-auto bg-slate-900 rounded-lg border border-slate-800 p-2 flex justify-center" >
                                        <svg viewBox="0 0 800 710" className = "w-full max-w-[650px] h-auto font-mono text-[10px]" style = {{ minWidth: '550px' }}>
                                            <defs>
                                            <marker id="arrow" viewBox = "0 0 10 10" refX = "6" refY = "5" markerWidth = "6" markerHeight = "6" orient = "auto-start-reverse" >
                                                <path d="M 0 1 L 10 5 L 0 9 z" fill = "#475569" />
                                                    </marker>
                                                    < marker id = "arrow-active" viewBox = "0 0 10 10" refX = "6" refY = "5" markerWidth = "6" markerHeight = "6" orient = "auto-start-reverse" >
                                                        <path d="M 0 1 L 10 5 L 0 9 z" fill = "#f59e0b" />
                                                            </marker>
                                                            </defs>
                                                            < g > <rect x="140" y = "10" width = "120" height = "35" rx = "17" className = {`fill-slate-950 stroke-2 ${isNodeActive(["START"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="32" textAnchor="middle" className={`font-bold ${isNodeActive(["START"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>START</text > </g>
                                                                < path d = "M 200 45 L 200 70" fill = "none" markerEnd = {`url(#${isNodeActive(["START"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["START"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                    < g > <rect x="130" y = "70" width = "140" height = "35" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="91" textAnchor="middle" className={`font-bold ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>i = 0</text > </g>
                                                                        < path d = "M 200 105 L 200 130" fill = "none" markerEnd = {`url(#${isNodeActive(["OUTER_LOOP_INIT"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["OUTER_LOOP_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                            < g > <polygon points="200,130 285,160 200,190 115,160" className = {`fill-slate-950 stroke-2 ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="163" textAnchor="middle" className={`font-bold ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>i &lt; (s - 1)?</text > </g>
                                                                                < path d = "M 200 190 L 200 215" fill = "none" markerEnd = {`url(#${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                    < g > <rect x="120" y = "215" width = "160" height = "40" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["MIN_INIT"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="233" textAnchor="middle" className={`font-bold ${isNodeActive(["MIN_INIT"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>m = myNumber[i]</text > <text x="200" y = "247" textAnchor = "middle" className = {`font-bold ${isNodeActive(["MIN_INIT"]) ? 'fill-amber-400' : 'fill-slate-300'}`}> mIdx = i < /text></g >
                                                                                        <path d="M 200 255 L 200 280" fill = "none" markerEnd = {`url(#${isNodeActive(["MIN_INIT"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["MIN_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                            < g > <rect x="130" y = "280" width = "140" height = "35" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["INNER_LOOP_INIT"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="301" textAnchor="middle" className={`font-bold ${isNodeActive(["INNER_LOOP_INIT"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>j = i + 1</text > </g>
                                                                                                < path d = "M 270 297.5 L 360 297.5 L 360 310" fill = "none" markerEnd = {`url(#${isNodeActive(["INNER_LOOP_INIT"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["INNER_LOOP_INIT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                    < g > <polygon points="360,310 435,335 360,360 285,335" className = {`fill-slate-950 stroke-2 ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="360" y="338" textAnchor="middle" className={`font-bold ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>j &lt; s?</text > </g>
                                                                                                        < path d = "M 360 360 L 360 390" fill = "none" markerEnd = {`url(#${isNodeActive(["INNER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                            < g > <polygon points="360,390 455,420 360,450 265,420" className = {`fill-slate-950 stroke-2 ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="360" y="423" textAnchor="middle" className={`font-bold ${isNodeActive(["COMPARE"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>myNumber[j] &lt; m?</text > </g>
                                                                                                                < path d = "M 455 420 L 510 420" fill = "none" markerEnd = {`url(#${isNodeActive(["COMPARE"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                    < g > <rect x="510" y = "400" width = "150" height = "40" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["UPDATE_MIN"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="585" y="418" textAnchor="middle" className={`font-bold ${isNodeActive(["UPDATE_MIN"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>m = myNumber[j]</text > <text x="585" y = "432" textAnchor = "middle" className = {`font-bold ${isNodeActive(["UPDATE_MIN"]) ? 'fill-amber-400' : 'fill-slate-300'}`}> mIdx = j < /text></g >
                                                                                                                        <path d="M 585 400 L 585 355" fill = "none" markerEnd = {`url(#${isNodeActive(["UPDATE_MIN"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["UPDATE_MIN"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                            < g > <rect x="540" y = "320" width = "90" height = "35" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["INNER_INC"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="585" y="341" textAnchor="middle" className={`font-bold ${isNodeActive(["INNER_INC"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>j++</text > </g>
                                                                                                                                < path d = "M 540 337.5 L 445 337.5" fill = "none" markerEnd = {`url(#${isNodeActive(["INNER_INC"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["INNER_INC"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                    < path d = "M 360 450 L 360 475 L 585 475 L 585 355" fill = "none" className = {`stroke-2 fill-none ${isNodeActive(["COMPARE"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                        < g > <polygon points="200,470 285,500 200,530 115,500" className = {`fill-slate-950 stroke-2 ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="503" textAnchor="middle" className={`font-bold ${isNodeActive(["SWAP_CHECK"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>m &lt; myNumber[i]?</text > </g>
                                                                                                                                            < path d = "M 285 335 L 250 335 L 250 455 L 200 455 L 200 470" fill = "none" markerEnd = {`url(#${isNodeActive(["INNER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["INNER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                < g > <rect x="110" y = "550" width = "180" height = "45" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["SWAP"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="200" y="567" textAnchor="middle" className={`font-bold ${isNodeActive(["SWAP"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>temp = myNumber[i];</text > <text x="200" y = "583" textAnchor = "middle" className = {`font-bold ${isNodeActive(["SWAP"]) ? 'fill-amber-400' : 'fill-slate-300'}`}> myNumber[i]=m; myNumber[mIdx] = temp; </text></g >
                                                                                                                                                    <path d="M 200 530 L 200 550" fill = "none" markerEnd = {`url(#${isNodeActive(["SWAP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                        < g > <polygon points="120,620 290,620 270,660 100,660" className = {`fill-slate-950 stroke-2 ${isNodeActive(["PRINT"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="195" y="644" textAnchor="middle" className={`font-bold ${isNodeActive(["PRINT"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>Call myCall2() to print array</text > </g>
                                                                                                                                                            < path d = "M 200 595 L 200 620" fill = "none" markerEnd = {`url(#${isNodeActive(["SWAP"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["SWAP"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                                < path d = "M 115 500 L 90 500 L 90 635 L 100 635" fill = "none" markerEnd = {`url(#${isNodeActive(["SWAP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["SWAP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                                    < g > <rect x="15" y = "380" width = "60" height = "35" rx = "4" className = {`fill-slate-950 stroke-2 ${isNodeActive(["OUTER_LOOP_INC"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="45" y="401" textAnchor="middle" className={`font-bold ${isNodeActive(["OUTER_LOOP_INC"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>i++</text > </g>
                                                                                                                                                                        < path d = "M 100 640 L 45 640 L 45 415" fill = "none" markerEnd = {`url(#${isNodeActive(["PRINT"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["PRINT"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                                            < path d = "M 45 380 L 45 160 L 115 160" fill = "none" markerEnd = {`url(#${isNodeActive(["OUTER_LOOP_INC"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["OUTER_LOOP_INC"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                                                < g > <rect x="30" y = "100" width = "70" height = "35" rx = "17" className = {`fill-slate-950 stroke-2 ${isNodeActive(["FINISHED"]) ? 'stroke-amber-500 fill-amber-950/20' : 'stroke-slate-700'}`} /><text x="65" y="121" textAnchor="middle" className={`font-bold ${isNodeActive(["FINISHED"]) ? 'fill-amber-400' : 'fill-slate-300'}`}>END</text > </g>
                                                                                                                                                                                    < path d = "M 115 160 L 65 160 L 65 135" fill = "none" markerEnd = {`url(#${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'arrow-active' : 'arrow'})`} className = {`stroke-2 ${isNodeActive(["OUTER_LOOP_CHECK"]) ? 'stroke-amber-500' : 'stroke-slate-600'}`} />
                                                                                                                                                                                        </svg>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        </div>
                )}
{
    activeTab === 'code' && (
        <div className="flex-1 flex flex-col font-mono text-xs overflow-auto bg-slate-950 border border-slate-900 rounded p-2.5 max-h-[350px]" >
            <div className="text-slate-500 mb-2 border-b border-slate-900 pb-1 flex justify-between" >
                <span>Figure Q2.1 - C Implementation </span>
                    < span className = "text-[10px] text-amber-500 font-sans" > Active lines highlight in yellow </span>
                        </div>
    {
        sourceCodeLines.map((codeObj, index) => {
            const isHighlighted = codeObj.phases && codeObj.phases.includes(activePhase);
            return (
                <div 
                          key= { index }
            className = {`flex py-0.5 leading-5 transition-colors ${isHighlighted ? "bg-amber-500/20 border-l-4 border-amber-500 pl-1 text-white" : "text-slate-300 border-l-4 border-transparent"
                }`
        }
                        >
            <span className="w-8 text-slate-600 select-none text-right pr-3.5" > { codeObj.line } </span>
        < pre className = "whitespace-pre-wrap flex-1" > { codeObj.text } </pre>
        </div>
        );
    })
}
</div>
                )}
{
    activeTab === 'trace' && (
        <div className="flex-1 flex flex-col h-full" >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-t-lg border-b-0" >
                <div className="flex items-center gap-2" >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-slate-300" > stdout(C Console Output) </span>
                            </div>
                            </div>
                            < div className = "bg-slate-950 rounded-b-lg border border-slate-800 p-4 font-mono text-xs text-emerald-400 flex-1 min-h-[220px] max-h-[280px] overflow-y-auto shadow-inner flex flex-col gap-1.5" >
                            {
                                activeConsole.map((line, idx) => (
                                    <div key= { idx } className = {`transition-all duration-300 ${idx === activeConsole.length - 1 ? 'text-white font-bold animate-pulse' : ''}`} > { line } </div>
                      ))
}
<div ref={ consoleEndRef } />
    </div>
    </div>
                )}
</div>
    </div>
    </div>

    < div className = "lg:col-span-5 flex flex-col gap-6" >
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden" >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex justify-between items-center mb-3" >
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2" >
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                            Exam Trace Table Generator
                                </h3>
                                </div>
                                < p className = "text-xs text-slate-400 mb-4" > Your exam requires tracing how arrays change.The table below compiles dynamically.</p>
                                    < div className = "overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60 max-h-[220px]" >
                                        <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse" >
                                            <thead>
                                            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800" >
                                                <th className="p-2 border-r border-slate-800 text-center" > Pass </th>
                                                    < th className = "p-2 border-r border-slate-800 text-center" > i </th>
                                                        < th className = "p-2 border-r border-slate-800 text-center" > Init Value </th>
                                                            < th className = "p-2 border-r border-slate-800 text-center" > Final Min </th>
                                                                < th className = "p-2 border-r border-slate-800 text-center" > minIdx </th>
                                                                    < th className = "p-2" > Array After Pass </th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
{
    getTraceTableRows().map((row, idx) => (
        <tr key= { idx } className = "border-b border-slate-800 hover:bg-slate-800/40 transition-all" >
        <td className="p-2 border-r border-slate-800 text-center text-emerald-400 font-bold" > S{ row.pass } </td>
    < td className = "p-2 border-r border-slate-800 text-center" > { row.i } </td>
    < td className = "p-2 border-r border-slate-800 text-center text-slate-400" > { row.initialMin } </td>
    < td className = "p-2 border-r border-slate-800 text-center text-rose-400 font-bold" > { row.finalMin } </td>
    < td className = "p-2 border-r border-slate-800 text-center text-slate-400" > { row.minIdx } </td>
    < td className = "p-2 text-[11px] text-emerald-300 tracking-wider" > { row.arrayState.join(' ') } </td>
    </tr>
    ))
}
{
    getTraceTableRows().length === 0 && (
        <tr><td colSpan="6" className = "p-6 text-center text-slate-500 italic" > No passes completed yet.Press Play to build trace.< /td></tr >
                    )
}
</tbody>
    </table>
    </div>
    </div>

    < div className = "bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl" >
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2" >
            <CheckCircle className="w-4 h-4 text-amber-500" />
                Lecturer Guidelines: "Deep Learning" Notes
                    </h3>
                    < div className = "flex flex-col gap-3 text-xs leading-relaxed text-slate-300" >
                        <div className="p-3 bg-slate-900 rounded border border-slate-800" >
                            <p className="font-bold text-amber-400 mb-1" >💡 Selection Sort vs Bubble Sort comparison </p>
                                < p className = "text-slate-400" > Unlike Bubble Sort which swaps elements adjacent to one another continuously, Selection Sort finds the absolute minimum first, then executes only a single swap per pass.</p>
                                    </div>
                                    </div>
                                    </div>

                                    < div className = "bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl" >
                                        <div className="flex items-center justify-between mb-4" >
                                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2" >
                                                <HelpCircle className="w-4 h-4 text-amber-500" />
                                                    Exam Prep Quick Check
                                                        </h3>
                                                        </div>
                                                        < div className = "flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1" >
                                                        {
                                                            quizQuestions.map((question) => {
                                                                const selectedAns = quizAnswers[question.id];
                                                                const showResults = quizScore !== null;
                                                                const isCorrect = selectedAns === question.correct;

                                                                return (
                                                                    <div key= { question.id } className = "border-b border-slate-900 pb-4 last:border-b-0" >
                                                                        <p className="text-xs font-bold text-slate-200 mb-2.5" > Q{ question.id }. { question.q } </p>
                                                                            < div className = "flex flex-col gap-2" >
                                                                            {
                                                                                question.options.map((opt, optIdx) => {
                                                                                    let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800";
                                                                                    if (selectedAns === optIdx) btnStyle = "bg-amber-500/10 border-amber-500 text-amber-300";
                                                                                    if (showResults) {
                                                                                        if (optIdx === question.correct) btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold";
                                                                                        else if (selectedAns === optIdx && !isCorrect) btnStyle = "bg-rose-500/10 border-rose-500 text-rose-300";
                                                                                    }
                                                                                    return (
                                                                                        <button
                              key= { optIdx }
                                                                                    disabled = { showResults }
                                                                                    onClick = {() => handleSelectAnswer(question.id, optIdx)
                                                                                }
                              className = {`w-full text-left p-2.5 rounded border text-xs transition-all flex items-start gap-2 ${btnStyle}`}
                                                                                >
                                                                                <span className="font-mono bg-slate-950 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-slate-800 text-[10px] text-slate-400" > { String.fromCharCode(65 + optIdx) } </span>
                                                                                    < span > { opt } </span>
                                                                                    </button>
                          );
                        })}
</div>
{
    showResults && (
        <div className="mt-2.5 p-2 px-3 bg-slate-900 rounded border border-slate-800 text-[11px] leading-relaxed" >
            <p className="text-slate-400 italic" > { question.explanation } </p>
                </div>
                      )
}
</div>
                  );
                })}
</div>
    < div className = "border-t border-slate-900 mt-4 pt-4" >
        { quizScore === null ? (
            <button
                    onClick= { handleSubmitQuiz }
                    disabled = { Object.keys(quizAnswers).length < quizQuestions.length }
className = "w-full py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 font-bold text-xs rounded transition-all shadow"
    >
    Submit Quiz Answers
        </button>
                ) : (
    <div className= "w-full flex justify-between items-center bg-slate-900/80 p-3 rounded border border-slate-800" >
    <span className="text-xs text-slate-300" > Your Score: <strong className="text-amber-400 font-bold text-sm" > { quizScore } / { quizQuestions.length } < /strong></span >
        <button onClick={ () => { setQuizScore(null); setQuizAnswers({}); } } className = "text-[10px] bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-400" > Try Again </button>
            </div>
                )}
</div>
    </div>
    </div>
    </main>
      )}

{/* MODULE 2 CONTENT */ }
{
    activeModule === 'Q1_SORT_DUEL' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" >
            <div className="lg:col-span-7 flex flex-col gap-6" >
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative" >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6" >
                            <div>
                            <h3 className="font-bold text-lg text-white" > Q1 Sort Duel Arena </h3>
                                < p className = "text-slate-400 text-xs font-mono" > Array: <span className="text-amber-400" > [22, 5, 67, 98, 45, 32, 101, 99, 73, 10] < /span></p >
                                    </div>
                                    < div className = "flex bg-slate-900 border border-slate-800 rounded-lg p-1" >
                                        <button onClick={ () => { setQ1SelectedAlgorithm('bubble'); setQ1Step(0); } } className = {`px-3 py-1.5 text-xs font-bold rounded ${q1SelectedAlgorithm === 'bubble' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`
}> Bubble Sort </button>
    < button onClick = {() => { setQ1SelectedAlgorithm('selection'); setQ1Step(0); }} className = {`px-3 py-1.5 text-xs font-bold rounded ${q1SelectedAlgorithm === 'selection' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}> Selection Sort </button>
        </div>
        </div>

        < div className = "h-52 flex items-end justify-between gap-2 bg-slate-900/50 p-4 border border-slate-800/80 rounded-lg mb-4" >
        {
            getQ1ArrayState(q1SelectedAlgorithm, q1Step).map((val, idx) => {
                const maxVal = 101;
                const heightPercent = (val / maxVal) * 100;
                let barStyle = "bg-slate-700 border-slate-600";
                if (q1SelectedAlgorithm === 'bubble') {
                    if (idx >= 10 - q1Step) barStyle = "bg-emerald-600/90 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                } else {
                    if (idx < q1Step) barStyle = "bg-emerald-600/90 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                }
                return (
                    <div key= { idx } className = "flex-1 flex flex-col items-center h-full justify-end" >
                        <span className="text-[10px] font-mono text-slate-300 font-bold mb-1" > { val } </span>
                            < div className = {`w-full ${barStyle} border-t-2 rounded-t transition-all duration-500 flex items-center justify-center`
            } style = {{ height: `${Math.max(15, heightPercent)}%` }} >
            <span className="text-xs font-mono font-bold text-shadow hidden sm:inline text-white/90" > { val } </span>
                </div>
                < span className = "mt-1 text-[9px] font-mono text-slate-500" > [{ idx }] </span>
                    </div>
                  );
                })}
</div>

    < div className = "flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800" >
        <div className="flex items-center gap-2" >
            <button disabled={ q1Step === 0 } onClick = {() => setQ1Step(p => p - 1)} className = "p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 disabled:opacity-30 border border-slate-800" > <ChevronLeft className="w-5 h-5" /> </button>
                < span className = "text-xs font-mono text-slate-300" > Step: <strong className="text-amber-400 font-bold" > Pass { q1Step } </strong> / 5 </span>
                    < button disabled = { q1Step === 5} onClick = {() => setQ1Step(p => p + 1)} className = "p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 disabled:opacity-30 border border-slate-800" > <ChevronRight className="w-5 h-5" /> </button>
                        </div>
                        < button onClick = {() => setQ1IsPlaying(!q1IsPlaying)} className = {`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold ${q1IsPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'}`}> { q1IsPlaying?<Pause className = "w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} { q1IsPlaying ? "Stop Auto" : "Auto Play Passes" } </button>
                            </div>
                            </div>

                            < div className = "bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl" >
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2" >
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        Step Trace Cheat - Sheet for Q1(a) & (b)
                                            </h3>
                                            < p className = "text-xs text-slate-400 leading-relaxed" > Refer to the comparative guides on the right to check exact state elements for bubble and selection sorting passes on the Feb 2025 past papers.</p>
                                                </div>
                                                </div>

                                                < div className = "lg:col-span-5 flex flex-col gap-6" >
                                                    <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden" >
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                                                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2" > <Award className="w-4 h-4 text-emerald-400" /> UTM - UTHM Exam Paper Solutions(Q1) </h3>
                                                                < div className = "flex flex-col gap-4" >
                                                                    <div>
                                                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2" > Q1(a) Bubble Sort Traces </h4>
                                                                        < div className = "bg-slate-900 rounded border border-slate-800 overflow-hidden font-mono text-[11px]" >
                                                                            <div className="grid grid-cols-12 bg-slate-950 p-2 border-b border-slate-800 text-slate-400" >
                                                                                <span className="col-span-2 text-center" > Pass </span>
                                                                                    < span className = "col-span-10" > Array State </span>
                                                                                        </div>
{
    [1, 2, 3, 4, 5].map(p => (
        <div key= { p } className = "grid grid-cols-12 p-2 border-b border-slate-850 hover:bg-slate-850/40" >
        <span className="col-span-2 text-center text-amber-500 font-bold" > P{ p } </span>
    < span className = "col-span-10 text-slate-200" > { getQ1ArrayState('bubble', p).join(' ') } </span>
    </div>
    ))
}
</div>
    </div>
    < div >
    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2" > Q1(b) Selection Sort Traces </h4>
        < div className = "bg-slate-900 rounded border border-slate-800 overflow-hidden font-mono text-[11px]" >
            <div className="grid grid-cols-12 bg-slate-950 p-2 border-b border-slate-800 text-slate-400" >
                <span className="col-span-2 text-center" > Pass </span>
                    < span className = "col-span-10" > Array State </span>
                        </div>
{
    [1, 2, 3, 4, 5].map(p => (
        <div key= { p } className = "grid grid-cols-12 p-2 border-b border-slate-850 hover:bg-slate-850/40" >
        <span className="col-span-2 text-center text-sky-500 font-bold" > P{ p } </span>
    < span className = "col-span-10 text-slate-200" > { getQ1ArrayState('selection', p).join(' ') } </span>
    </div>
    ))
}
</div>
    </div>
    </div>
    </div>
    </div>
    </main>
      )}

{/* MODULE 3 CONTENT */ }
{
    activeModule === 'Q4_BST_TRAVERSAL' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" >
            <div className="lg:col-span-7 flex flex-col gap-6" >
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative" >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6" >
                            <div>
                            <h3 className="font-bold text-lg text-white" > Interactive BST Traversal Simulator </h3>
                                < p className = "text-xs text-slate-400" > Visual pathways for Binary Search Tree questions </p>
                                    </div>
                                    < div className = "flex bg-slate-900 border border-slate-800 rounded-lg p-1" >
                                        <button onClick={ () => setActiveTreePreset('FEB_2025') } className = {`px-3 py-1 text-xs font-bold rounded ${activeTreePreset === 'FEB_2025' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`
}> Feb 2025 Tree </button>
    < button onClick = {() => setActiveTreePreset('JULY_2025')} className = {`px-3 py-1 text-xs font-bold rounded ${activeTreePreset === 'JULY_2025' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}> July 2025 Tree </button>
        </div>
        </div>

        < div className = "grid grid-cols-3 gap-2 mb-4 bg-slate-900 p-2 rounded-lg border border-slate-800" >
        {
            ['PREORDER', 'INORDER', 'POSTORDER'].map(mode => (
                <button key= { mode } onClick = {() => setSelectedTraversal(mode)} className = {`py-1.5 rounded text-xs font-bold uppercase transition-all ${selectedTraversal === mode ? 'bg-slate-800 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-300'}`}> { mode.toLowerCase() } </button>
                ))}
</div>

    < div className = "w-full overflow-x-auto bg-slate-900 rounded-lg border border-slate-800 p-4 flex justify-center" >
        <svg viewBox="0 0 500 400" className = "w-full max-w-[480px] h-auto font-mono text-xs select-none" style = {{ minWidth: '400px' }}>
        {
            treesData[activeTreePreset].nodes.map(node => {
                const lChild = node.left ? treesData[activeTreePreset].nodes.find(n => n.id === node.left) : null;
                const rChild = node.right ? treesData[activeTreePreset].nodes.find(n => n.id === node.right) : null;
                return (
                    <g key= {`lines-${node.id}`
            }>
            { lChild && <line x1={ node.x } y1 = { node.y } x2 = { lChild.x } y2 = { lChild.y } className = "stroke-slate-700 stroke-2" />}
{ rChild && <line x1={ node.x } y1 = { node.y } x2 = { rChild.x } y2 = { rChild.y } className = "stroke-slate-700 stroke-2" />}
</g>
                    );
                  })}
{
    treesData[activeTreePreset].nodes.map(node => {
        const isVisited = traversalAnimationHistory.includes(node.id);
        const isCurrentlyActive = traversalAnimationHistory[traversalStep] === node.id;
        let circClass = "fill-slate-950 stroke-slate-700 stroke-2";
        let textClass = "fill-slate-300 font-bold";
        if (isCurrentlyActive) {
            circClass = "fill-amber-500 stroke-amber-400 stroke-2";
            textClass = "fill-slate-950 font-black";
        } else if (isVisited) {
            circClass = "fill-emerald-600/90 stroke-emerald-500 stroke-2";
            textClass = "fill-emerald-100 font-bold";
        }
        return (
            <g key= {`node-${node.id}`
    } className = "transition-all duration-300" >
    <circle cx={ node.x } cy = { node.y } r = "18" className = { circClass } />
    <text x={ node.x } y = { node.y + 4 } textAnchor = "middle" className = { textClass } > { node.id } </text>
    </g>
    );
})}
</svg>
    </div>

    < div className = "mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800" >
        <button onClick={ handleRunTraversalAnimation } disabled = { treeIsAnimating } className = "w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-all" > { treeIsAnimating? "Animating...": `Animate ${selectedTraversal.toLowerCase()}` } </button>
            < div className = "text-xs text-slate-400" > Preset: <span className="text-amber-400 font-bold" > { activeTreePreset.replace('_', ' ') } < /span></div >
                </div>
                </div>
                </div>

                < div className = "lg:col-span-5 flex flex-col gap-6 animate-fade-in" >
                    <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden" >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-3" > Traversal Path Output </h3>
                                < div className = "p-4 bg-slate-900 rounded-lg border border-slate-800 min-h-[70px] flex flex-wrap items-center gap-1.5 font-mono text-sm" >
                                {
                                    traversalAnimationHistory.map((node, index) => (
                                        <span key= { index } className = "flex items-center gap-1.5" >
                                        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded font-black" > { node } </span>
                    { index<traversalAnimationHistory.length - 1 && <span className="text-slate-600">→</span>}
                                    </span>
                ))}
{ traversalAnimationHistory.length === 0 && <span className="text-slate-500 italic text-xs" > Click the animate button to visualize traversal.</span> }
</div>
    </div>

    < div className = "bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl" >
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-3" > Traversal Rules Cheat - Sheet </h3>
            < div className = "flex flex-col gap-3.5 text-xs text-slate-300" >
                <div className="p-3 bg-slate-900 border border-slate-855 rounded" >
                    <div className="flex justify-between font-bold text-amber-400 mb-1" > <span>Preorder Traversal < /span><span>Root → Left → Right</span > </div>
                        < p className = "text-slate-400 text-[11px]" > Visits the parent / root node first, then down the left subtree, then the right subtree.</p>
                            </div>
                            < div className = "p-3 bg-slate-900 border border-slate-855 rounded" >
                                <div className="flex justify-between font-bold text-emerald-400 mb-1" > <span>Inorder Traversal < /span><span>Left → Root → Right</span > </div>
                                    < p className = "text-slate-400 text-[11px]" > Visits left child first, then root, then right child.This lists elements in sorted ascending order on BSTs.</p>
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