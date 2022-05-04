
const delay = ms => new Promise(res => setTimeout(res, ms));

class Head {
    constructor(string) {
        let parsed = Head.parse(string);
        let state = parsed[0];
        let location = parsed[1];
        this.update(state, location);
    }

    get status() {
		return [this.state, this.location];
    }

    update(state, location) {
        this.state = state;
        this.location = location;
    }

    static parse(string) {
        let parsed = string.split(" ");
        parsed[1] = parseInt(parsed[1]);
        return parsed;
    }
}

class Tape {
    constructor(string) {
        this.tape = Tape.parse(string);
    }

    get status() {
        return this.tape.join(' | ');
    }

    extendLeft() {
        this.tape.unshift("B");
    }

    extendRight() {
        this.tape.push("B");
    }

    write(symbol, location) {
        this.tape[location] = symbol;
    }

    static parse(string) {
        return string.split(" ")
    }
}

class Machine {
    constructor(ruleset, tape, head) {
        this.ruleset = ruleset;
        this.tape = tape;
        this.head = head;
        this.running = false;
    }

    get status() {
		let [head_state, head_location] = this.head.status;
		return ['CURRENT STATE: ' + head_state, this.tape.status + '<br>' + '&#8200;'.repeat(parseInt(head_location) * 6) + '^']
    }

    shiftHead(move) {
        if (this.head.location == 0 && move == "L") {
            this.tape.extendLeft();
        } else if (this.head.location == this.tape.tape.length - 1 && move == "R") {
            this.tape.extendRight();
            this.head.location += 1;
        } else if (move == "L") {
            this.head.location -= 1;
        } else if (move == "R") {
            this.head.location += 1;
        }
    }

    stepLookup() {
        if (this.ruleset[this.head.state] && this.ruleset[this.head.state][this.tape.tape[this.head.location]]) {
            let output = this.ruleset[this.head.state][this.tape.tape[this.head.location]];
            if (output[0] == this.head.state && output[1] == this.tape.tape[this.head.location] && !(output[2] == 'L' || output[2] == 'R')) {
                return false;
            }
            return this.ruleset[this.head.state][this.tape.tape[this.head.location]];
        } else {
            return false;
        }
    }

    step() {
        let new_state = this.stepLookup()[0]
        let new_symbol = this.stepLookup()[1]
        let move = this.stepLookup()[2]

        this.tape.write(new_symbol, this.head.location)
        this.head.state = new_state
        this.shiftHead(move)
    }

    async run() {
        this.running = true;
        while (this.stepLookup()) {
            Printer.print_status(this.status, true);
            this.step();
			await delay(1500);
        }

        Printer.print_status(this.status, true);
        Printer.print('FINAL STATE: ' + this.head.state + ' | HALT');
    }
}

class Printer {
    static print(string, flag=false) {
		if (flag) this.clear()
        let div = document.getElementById("TuringMachineState")
		div.innerHTML = string
    }

    static print_status(status, flag=false) {
		if (flag) this.clear();
        let [state, tape] = status;
        let state_div = document.getElementById("TuringMachineState");
		let tape_div = document.getElementById("TuringMachineTape");
		state_div.innerHTML = state;
        tape_div.innerHTML = tape; 
    }

    static clear() {
        let div = document.getElementById("TuringMachineTape");
        div.innerHTML = '';
    }
}

$('#tape_button').click(function() {
	Printer.clear();
	
	let ruleset = JSON.parse($("form")[0]['ruleset'].value);
	let tape = new Tape($("form")[0]['tape'].value);
	let head = new Head($("form")[0]['head'].value);
	
	let input_alphabet = new Set();
	let tape_alphabet = new Set();
	let states = new Set();
	
	tape_alphabet.add('B');
	states.add(head.state);
	
	// Updates state and tape_alphabet list by iterating through the ruleset
	for (let state in ruleset) {
		states.add(state);
		for (let symbol in ruleset[state]) {
			states.add(ruleset[state][symbol][0]);
			tape_alphabet.add(ruleset[state][symbol][1]);
		}
	}
	
	// Updates tape_alphabet list by iterating through the tape
	for (let character of tape['tape']) {
		input_alphabet.add(character);
		tape_alphabet.add(character);
	}
	
	tape_alphabet = [...tape_alphabet];
	states = [...states];
	
	GLOBAL_TURING_MACHINE_TO_LAMBDA_CALCULUS = [head.state, states, tape_alphabet, ruleset];

	m = new Machine(ruleset, tape, head);
	m.run()

	event.preventDefault();
})

/**
function initialize() {
    form = document.querySelectorAll("form")[0];
    form.addEventListener("submit", function(event) {
        
		Printer.clear();

        let ruleset = JSON.parse(form.elements['ruleset'].value)
        let tape = new Tape(form.elements['tape'].value)
        let head = new Head(form.elements['head'].value)
		
		let input_alphabet = new Set();
		let tape_alphabet = new Set();
		let states = new Set();
		
		tape_alphabet.add('B');
		states.add(head.state);
		
		// updates state and tape_alphabet list by iterating through the ruleset
		for (let state in ruleset) {
			states.add(state);
			for (let symbol in ruleset[state]) {
				states.add(ruleset[state][symbol][0]);
				tape_alphabet.add(ruleset[state][symbol][1]);
			}
		}
		
		// Updates tape_alphabet list by iterating through the tape
		for (let character of tape['tape']) {
			input_alphabet.add(character);
			tape_alphabet.add(character);
		}
		
		input_alphabet = [...input_alphabet];
		tape_alphabet = [...tape_alphabet];
		states = [...states];
		
		let I_M = initial_configuration_function(head.state, states, tape_alphabet, input_alphabet);
		let F_M = final_configuration_function(tape_alphabet, input_alphabet);
		let [ T_M, lst ] = step_configuration_function(tape_alphabet, states, ruleset);

		GLOBAL_TURING_MACHINE_TO_LAMBDA_CALCULUS = [I_M, T_M, F_M, lst, '(' + 'λx.' + F_M + '(' + T_M + '(' + I_M + 'x))' + ')'];
		INPUT_ALPHABET = input_alphabet;

        m = new Machine(ruleset, tape, head);
        m.run()

        event.preventDefault();
    })
}

initialize();

**/