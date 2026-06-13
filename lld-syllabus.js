(function buildLldSyllabus() {
  const q = (level, question, answer) => ({ level, question, answer });
  const card = (title, body) => ({ title, body });

  function topic(id, week, day, title, goal, subtopics) {
    return { id, week, day, title, goal, subtopics };
  }

  function lesson(spec) {
    return {
      level: "CORE",
      concepts: [],
      examples: [],
      flow: [],
      tradeoffs: [],
      failures: [],
      useWhen: [],
      avoidWhen: [],
      questions: [],
      ...spec
    };
  }

  function principleLesson(name, principle, smell, fix, code) {
    return lesson({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      problem: `${name} prevents a common maintainability failure: ${smell}`,
      mentalModel: `Think of ${name} as a pressure test. If the interviewer adds one new requirement, the design should change in one focused place instead of spreading edits across many classes.`,
      core: principle,
      deepDive: `In interviews, do not recite the definition alone. Show the before state, name the design smell, then show the smaller boundary that removes the smell. This is how SOLID becomes design reasoning instead of memorized theory.`,
      concepts: [
        card("Principle", principle),
        card("Design smell", smell),
        card("Fix", fix),
        card("Interview use", "When a follow-up arrives, explain which class changes and which classes stay untouched.")
      ],
      examples: [
        card("Parking lot", "Fee rules should not be hardcoded inside ExitGate if mall, airport, and office lots calculate differently."),
        card("BookMyShow", "Seat lock, payment, and booking confirmation are related but should not be one giant method with hidden side effects."),
        card("Production code", "A small class with one reason to change is easier to review, test, and rollback.")
      ],
      flow: ["Identify smell", "Name the reason to change", "Move responsibility", "Introduce boundary", "Show follow-up path"],
      tradeoffs: [
        card("Benefit", "Lower regression risk because new behavior is isolated."),
        card("Cost", "More classes and indirection. Keep the abstraction worth its weight."),
        card("Decision rule", "Add the boundary when variation is real or very likely.")
      ],
      failures: [
        "Creating interfaces for every class even when there is no variation.",
        "Splitting code by technical layer but not by responsibility.",
        "Using SOLID words without showing the changed code path."
      ],
      useWhen: ["The same class changes for many reasons.", "New rules keep arriving.", "Tests require too many concrete dependencies."],
      avoidWhen: ["The behavior is tiny and stable.", "The abstraction hides rather than clarifies the domain."],
      codeTitle: `${name} Java sketch`,
      code,
      questions: [
        q("EASY", `What problem does ${name} solve?`, `${name} solves ${smell.toLowerCase()} by pushing the design toward ${fix.toLowerCase()}.`),
        q("MEDIUM", "How do you avoid overengineering with SOLID?", "Use SOLID only where a real change point exists. A simple direct class is better than a fake abstraction."),
        q("HARD", "How would you explain this principle under a follow-up?", "Show the original class, state what must change, then add one focused class or interface so stable code remains stable.")
      ],
      revision: `${name}: ${principle}`
    });
  }

  function patternLesson(name, solves, examples, code) {
    return lesson({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      level: name.includes("Repository") ? "ADV" : "CORE",
      problem: `${name} solves this design pressure: ${solves}`,
      mentalModel: "A design pattern is not decoration. It is a named way to keep a caller stable while behavior, creation, state, or integration changes behind a boundary.",
      core: solves,
      deepDive: "The interview trick is to say why the pattern is needed before saying the pattern name. If you cannot name the change it handles, the pattern is probably unnecessary.",
      concepts: [
        card("Trigger", solves),
        card("Boundary", "Usually an interface, small class, or lifecycle object."),
        card("Change path", "New behavior should usually mean a new implementation, not edits everywhere."),
        card("Testing", "Patterns often make it easier to pass fake dependencies into services.")
      ],
      examples: examples.map((item) => card(item[0], item[1])),
      flow: ["Find variation", "Define contract", "Move behavior", "Inject implementation", "Explain trade-off"],
      tradeoffs: [
        card("Readable when", "The variation is clear and the names are domain-specific."),
        card("Harmful when", "It creates a framework around a tiny one-off behavior."),
        card("Interview signal", "You can add a follow-up without rewriting the main workflow.")
      ],
      failures: [
        "Forcing the pattern before understanding the requirement.",
        "Using pattern names but writing the same switch statement anyway.",
        "Making a generic pattern implementation that hides domain language."
      ],
      useWhen: ["The problem has a repeated variation.", "The interviewer asks for new modes, rules, providers, or lifecycle behavior."],
      avoidWhen: ["There is exactly one behavior and no sign of change.", "A direct method would be clearer and easier to test."],
      codeTitle: `${name} Java sketch`,
      code,
      questions: [
        q("EASY", `When do you use ${name}?`, solves),
        q("MEDIUM", "What is the cost of this pattern?", "Extra types and indirection. Use it only when it makes the next change easier."),
        q("HARD", "How do you defend this pattern in an interview?", "Point to the exact follow-up it handles and show which code remains unchanged.")
      ],
      revision: `${name}: use it when ${solves.toLowerCase()}`
    });
  }

  function caseTopic(spec) {
    const idBase = spec.id;
    const className = spec.title.replace(/[^A-Za-z0-9]/g, "");
    const entityText = spec.entities.join(", ");
    const actorText = spec.actors.join(", ");
    const stateText = spec.states.join(", ");
    const patternText = spec.patterns.join(", ");

    return topic(idBase, spec.week, spec.day, spec.title, spec.goal, [
      lesson({
        id: `${idBase}-requirements`,
        name: "Requirements and Scope",
        problem: `A weak ${spec.title} answer jumps into classes before deciding what the system must actually do.`,
        mentalModel: `Start with one user story. For ${spec.title}, the story is: ${spec.mainStory}`,
        core: `Actors: ${actorText}. Core entities: ${entityText}.`,
        deepDive: `Scope control matters. You should design the main flow deeply, then explicitly defer features like admin dashboards, analytics, coupons, or external integrations unless the interviewer asks for them.`,
        concepts: [
          card("Actors", actorText),
          card("Main use case", spec.mainStory),
          card("Core invariant", spec.invariant),
          card("Out of scope first", spec.outOfScope || "Admin tools, analytics, and complex integrations.")
        ],
        examples: [
          card("Happy path", spec.flow.join(" -> ")),
          card("Failure path", spec.failure),
          card("Tech analogy", spec.techAnalogy)
        ],
        flow: ["Clarify actors", "List must-have use cases", "Name invariants", "Declare assumptions", "Then model classes"],
        tradeoffs: [
          card("Small scope", "Easier to code correctly in interview time."),
          card("Broad scope", "Shows product thinking but can dilute implementation depth."),
          card("Best answer", "Deeply solve the core flow and mention clean extension points.")
        ],
        failures: [
          "Starting with database tables before use cases.",
          "Including every possible feature and never finishing the central workflow.",
          "Ignoring the invariant that protects correctness."
        ],
        useWhen: ["Every case study should start here."],
        avoidWhen: ["Do not skip this because the problem feels familiar."],
        codeTitle: `${spec.title} requirement notes`,
        code: `// ${spec.title} minimum requirements
// Actors: ${actorText}
// Core entities: ${entityText}
// Invariant: ${spec.invariant}
// Main flow: ${spec.flow.join(" -> ")}`,
        questions: [
          q("EASY", `What are the actors in ${spec.title}?`, actorText),
          q("MEDIUM", "What is the most important invariant?", spec.invariant),
          q("HARD", "What would you intentionally keep out of scope first?", spec.outOfScope || "Admin panels, reporting, and optional integrations until the core flow is correct.")
        ],
        revision: `Begin ${spec.title} with actors, main flow, invariant, and assumptions.`
      }),
      lesson({
        id: `${idBase}-model`,
        name: "Domain Model and Class Boundaries",
        problem: `The model for ${spec.title} must separate entities that own state from services that coordinate workflows.`,
        mentalModel: "Entities own lifecycle state. Value objects make invalid primitive combinations harder. Services coordinate behavior across multiple entities. Policies hold rules that may vary.",
        core: `A clean first model contains: ${entityText}.`,
        deepDive: `For SDE2, explain ownership. Which class owns status? Which class validates transitions? Which service coordinates payment, assignment, locking, or notification? Ownership is more important than drawing many boxes.`,
        concepts: spec.entities.map((entity) => card(entity, spec.entityNotes?.[entity] || `${entity} is part of the core model and should have a clear responsibility.`)),
        examples: [
          card("Entity", `${spec.entities[0]} has identity and lifecycle.`),
          card("Value object", spec.valueObject || "Money, DateRange, SeatNumber, Location, or TimeRange makes primitives safer."),
          card("Service", `${className}Service coordinates the main flow without stealing all behavior from entities.`)
        ],
        flow: ["Identify entities", "Separate value objects", "Assign ownership", "Add service boundaries", "Check for anemic model"],
        tradeoffs: [
          card("Rich entities", "Good for invariants and behavior near data."),
          card("Service orchestration", "Good when a flow touches many objects."),
          card("Repository boundary", "Useful when persistence detail should not leak into domain code.")
        ],
        failures: [
          "All classes become getters and setters.",
          "One Manager class owns every rule.",
          "Value objects are replaced by loose strings and doubles."
        ],
        useWhen: ["The problem has several nouns and lifecycle rules.", "You need to explain why each class exists."],
        avoidWhen: ["Do not create a class for every noun if it has no behavior, identity, or important state."],
        codeTitle: `${spec.title} class sketch`,
        code: spec.modelCode || `final class ${className} {
    private final String id;
    private ${spec.states[0] ? "Status status" : "String status"};

    void validateInvariant() {
        // ${spec.invariant}
    }
}`,
        questions: [
          q("EASY", `What are the core entities in ${spec.title}?`, entityText),
          q("MEDIUM", "Where should business rules live?", "Near the entity or policy that owns the rule, not scattered across controllers or UI code."),
          q("HARD", "How do you avoid one giant service?", "Let entities protect their own state, use policies for varying rules, and keep the service as an orchestrator.")
        ],
        revision: `Model ${spec.title} by ownership, not by noun-count.`
      }),
      lesson({
        id: `${idBase}-workflow`,
        name: "Core Workflow and Java Implementation",
        problem: `The interviewer needs proof that your ${spec.title} design actually works at runtime.`,
        mentalModel: "A workflow is a sequence of state changes. Each step validates the current state, performs one mutation, and either commits the next state or compensates on failure.",
        core: `Main workflow: ${spec.flow.join(" -> ")}. Important states: ${stateText}.`,
        deepDive: `In a strong answer, code the method that changes the most important state. For ${spec.title}, the hard part is: ${spec.invariant}`,
        concepts: [
          card("States", stateText),
          card("Workflow", spec.flow.join(" -> ")),
          card("Invariant", spec.invariant),
          card("Failure handling", spec.failure)
        ],
        examples: [
          card("Success case", spec.successExample || spec.flow.join(" -> ")),
          card("Failure case", spec.failure),
          card("Test case", spec.testCase || `Assert that ${spec.invariant.toLowerCase()}.`)
        ],
        flow: spec.flow,
        tradeoffs: [
          card("Simple in-memory version", "Good for showing the design quickly."),
          card("Production version", "Needs persistence, transactions, locks, and idempotency around shared state."),
          card("Interview balance", "Code the core flow and discuss production upgrades.")
        ],
        failures: [
          spec.failure,
          "State changes happen before validation finishes.",
          "External calls are made while holding a lock.",
          "Retry creates duplicate side effects."
        ],
        useWhen: ["Always code at least one central workflow."],
        avoidWhen: ["Do not spend all interview time coding constructors and getters."],
        codeTitle: `${spec.title} workflow code`,
        code: spec.workflowCode,
        questions: [
          q("EASY", "Which method would you code first?", spec.firstMethod),
          q("MEDIUM", "What failure path must be handled?", spec.failure),
          q("HARD", "Where can a race condition happen?", spec.race || "Any check-plus-update over shared state must be atomic.")
        ],
        revision: `For ${spec.title}, code the workflow around ${spec.invariant}`
      }),
      lesson({
        id: `${idBase}-followups`,
        name: "Patterns, Edge Cases, and Follow-ups",
        level: "ADV",
        problem: `The follow-up round tests whether ${spec.title} can evolve without a rewrite.`,
        mentalModel: "Map every new requirement to a change point: rule variation, provider variation, lifecycle behavior, concurrency, or persistence.",
        core: `Useful patterns: ${patternText}. Common extensions: ${spec.extensions.join(", ")}.`,
        deepDive: `SDE2 answers should include trade-offs. Do not say one strategy is always best. Explain the simple version, the production version, and the cost of moving from one to the other.`,
        concepts: [
          card("Patterns", patternText),
          card("Extensions", spec.extensions.join(", ")),
          card("Concurrency", spec.race || "Protect shared resources with atomic check-plus-update."),
          card("Testing", spec.testCase || "Test the central invariant and one retry path.")
        ],
        examples: spec.extensions.map((item) => card(item, `Add this through a policy, strategy, adapter, or state transition instead of rewriting the whole flow.`)),
        flow: ["Hear follow-up", "Find change point", "Choose pattern", "Add new class", "Preserve core workflow", "Test invariant"],
        tradeoffs: spec.patterns.map((pattern) => card(pattern, `Useful in ${spec.title}, but only if it solves a visible change point.`)),
        failures: [
          "Adding follow-ups by editing the core method repeatedly.",
          "Ignoring duplicate requests, retries, or stale state.",
          "Choosing a complex pattern without explaining its cost."
        ],
        useWhen: ["The interviewer asks for a new rule, provider, status, or scale concern."],
        avoidWhen: ["Do not implement every follow-up before the base flow works."],
        codeTitle: `${spec.title} extension boundary`,
        code: `interface ${className}Policy {
    boolean canApply(${className}Context context);
}

final class ${className}Service {
    private final ${className}Policy policy;

    ${className}Service(${className}Policy policy) {
        this.policy = policy;
    }
}`,
        questions: [
          q("EASY", `Which patterns are useful in ${spec.title}?`, patternText),
          q("MEDIUM", "How do you add a new rule safely?", "Put the rule behind a policy or strategy and keep the main workflow stable."),
          q("HARD", "What makes this design SDE2-level?", "Concurrency awareness, idempotency, explicit state transitions, and tests around the invariant.")
        ],
        revision: `Follow-ups should attach to extension points, not rewrite ${spec.title}.`
      })
    ]);
  }

  const strategyCode = `interface FeePolicy {
    Money calculate(Ticket ticket);
}

final class HourlyFeePolicy implements FeePolicy {
    public Money calculate(Ticket ticket) {
        long hours = Math.max(1, ticket.parkedHours());
        return new Money("INR", hours * 5000);
    }
}

final class ExitGate {
    private final FeePolicy feePolicy;

    ExitGate(FeePolicy feePolicy) {
        this.feePolicy = feePolicy;
    }
}`;

  const foundation = [
    topic("w1d1", 1, 1, "Java OOP Foundations", "Build the object thinking needed before any case study.", [
      lesson({
        id: "class-object",
        name: "Class, Object, State, Behavior",
        problem: "LLD starts with deciding which object owns which responsibility. Without that, the code becomes a collection of random getters and setters.",
        mentalModel: "A class is a responsibility boundary. An object knows some state, protects that state, and exposes behavior that changes it safely.",
        core: "State is what an object knows. Behavior is what an object does. Invariants are rules that must always stay true.",
        deepDive: "Interviewers notice whether your entities are alive or anemic. A live entity protects its own invariants: a ShowSeat locks itself, a Booking confirms itself only with successful payment, and a BankAccount refuses invalid withdrawal.",
        concepts: [
          card("Class", "A blueprint that groups state and behavior."),
          card("Object", "A runtime instance with current state."),
          card("Responsibility", "The reason the class exists."),
          card("Invariant", "A rule that must never be broken.")
        ],
        examples: [
          card("BankAccount", "Owns balance and withdraw rules."),
          card("ParkingSpot", "Owns occupancy and supported vehicle type."),
          card("ShowSeat", "Owns availability for one show, not all shows.")
        ],
        flow: ["Name domain object", "List state", "List behavior", "List invariants", "Hide fields", "Expose commands"],
        tradeoffs: [
          card("Behavior in entity", "Protects state close to data."),
          card("Behavior in service", "Useful when a flow touches multiple entities."),
          card("Balance", "Entities protect invariants; services orchestrate workflows.")
        ],
        failures: [
          "Creating only data classes with setters.",
          "Putting every rule in one Manager class.",
          "Letting outside code mutate state without validation."
        ],
        useWhen: ["Every LLD problem."],
        avoidWhen: ["Do not create a class for a word that has no behavior, identity, or important state."],
        codeTitle: "Entity with behavior",
        code: `final class BankAccount {
    private long balanceInPaise;

    void withdraw(long amountInPaise) {
        if (amountInPaise <= 0) throw new IllegalArgumentException("Amount must be positive");
        if (balanceInPaise < amountInPaise) throw new IllegalStateException("Insufficient balance");
        balanceInPaise -= amountInPaise;
    }
}`,
        questions: [
          q("EASY", "What is the difference between state and behavior?", "State is data the object owns; behavior is the operation that uses or changes that state."),
          q("MEDIUM", "What is an anemic model?", "A model where entities are only data containers and all behavior is elsewhere."),
          q("HARD", "How do you decide whether behavior belongs in an entity or service?", "If behavior protects one object's invariant, keep it in the entity. If it coordinates multiple objects, put it in a service.")
        ],
        revision: "Class = responsibility boundary. Entity = state plus behavior plus invariant."
      }),
      lesson({
        id: "encapsulation",
        name: "Encapsulation",
        problem: "Public setters allow any caller to create impossible states. That is fatal in systems like booking, payment, and inventory.",
        mentalModel: "Encapsulation is a gate. Outside code requests a valid action; the object decides whether that action is allowed.",
        core: "Hide fields. Expose meaningful methods. Validate before mutation.",
        deepDive: "Encapsulation is not merely private fields. It is designing an API where invalid transitions are impossible or obvious. Instead of setStatus(CONFIRMED), use confirm(paymentReceipt).",
        concepts: [
          card("Private state", "Fields are not rewritten directly by callers."),
          card("Domain command", "Methods like lock, confirm, cancel, release."),
          card("Validation", "Check preconditions before mutation."),
          card("Safe read", "Return copies or immutable views for collections.")
        ],
        examples: [
          card("Booking", "confirm() should require successful payment."),
          card("Cart", "addItem() should reject zero or negative quantity."),
          card("Seat", "lock() should fail if already booked.")
        ],
        flow: ["Caller asks command", "Object checks state", "Object validates input", "Object mutates safely", "Invariant remains true"],
        tradeoffs: [
          card("Strong encapsulation", "Safer state and clearer APIs."),
          card("Too much hiding", "Can make simple read models awkward."),
          card("Rule", "Hide mutation; expose necessary query methods.")
        ],
        failures: ["Public setters for status.", "Returning mutable lists.", "Validation only in UI or controller."],
        useWhen: ["Any object with lifecycle or business rules."],
        avoidWhen: ["Do not hide simple read-only data so aggressively that the design becomes unusable."],
        codeTitle: "Encapsulated state transition",
        code: `final class Booking {
    private BookingStatus status = BookingStatus.PENDING;

    void confirm(PaymentReceipt receipt) {
        if (status != BookingStatus.PENDING) throw new IllegalStateException("Not pending");
        if (receipt.status() != PaymentStatus.SUCCESS) throw new IllegalArgumentException("Payment failed");
        status = BookingStatus.CONFIRMED;
    }
}`,
        questions: [
          q("EASY", "Is encapsulation only private fields?", "No. Private fields are a tool; the goal is protecting valid behavior."),
          q("MEDIUM", "Why are public setters risky?", "They allow callers to bypass rules and create invalid object states."),
          q("HARD", "How do you expose collections safely?", "Return List.copyOf or an unmodifiable view, and expose methods for controlled mutation.")
        ],
        revision: "Use domain commands, not random setters."
      }),
      lesson({
        id: "abstraction-polymorphism",
        name: "Abstraction and Polymorphism",
        problem: "If every new payment mode, fee rule, or notification channel requires editing the same switch statement, the design is fragile.",
        mentalModel: "Abstraction is the stable promise. Polymorphism is Java choosing the concrete behavior behind that promise at runtime.",
        core: "Use interfaces for replaceable behavior and depend on the contract, not the concrete class.",
        deepDive: "Good abstractions are named by behavior: PaymentGateway, FeePolicy, DispatchStrategy, NotificationSender. Weak abstractions are vague: Manager, Processor, Utility.",
        concepts: [
          card("Interface", "A small behavior contract."),
          card("Implementation", "Concrete class behind the contract."),
          card("Runtime dispatch", "Caller invokes interface; Java runs the concrete method."),
          card("Open-closed", "Add new behavior through a new class.")
        ],
        examples: [
          card("PaymentMethod", "UPI, card, wallet, net banking."),
          card("FeePolicy", "Mall, airport, weekend, membership pricing."),
          card("EvictionPolicy", "LRU, LFU, FIFO for cache.")
        ],
        flow: ["Find behavior variation", "Define interface", "Create implementations", "Inject into caller", "Call through contract"],
        tradeoffs: [
          card("Benefit", "New implementation without editing caller."),
          card("Cost", "More files and indirection."),
          card("Decision", "Use when variation is real.")
        ],
        failures: ["Creating huge interfaces.", "Using instanceof after defining interfaces.", "Naming the interface after a vendor instead of behavior."],
        useWhen: ["Different algorithms, providers, payment modes, or rules."],
        avoidWhen: ["One stable behavior with no follow-up pressure."],
        codeTitle: "Interface-based payment",
        code: `interface PaymentMethod {
    PaymentReceipt pay(Money amount);
}

final class UpiPayment implements PaymentMethod {
    public PaymentReceipt pay(Money amount) {
        return new PaymentReceipt("UPI", amount, PaymentStatus.SUCCESS);
    }
}

final class CheckoutService {
    PaymentReceipt checkout(Order order, PaymentMethod payment) {
        return payment.pay(order.total());
    }
}`,
        questions: [
          q("EASY", "Why use an interface?", "To depend on behavior instead of a concrete class."),
          q("MEDIUM", "How does polymorphism remove if-else?", "Each type owns its behavior; the caller invokes the same interface method."),
          q("HARD", "What makes an abstraction bad?", "It is too broad, vague, leaky, or created before a real change point exists.")
        ],
        revision: "Interface for behavior, implementation for details, caller stays stable."
      }),
      lesson({
        id: "inheritance-composition",
        name: "Inheritance vs Composition",
        problem: "Inheritance looks convenient until features combine and create subclass explosion.",
        mentalModel: "Inheritance says is-a. Composition says has-a behavior. Most LLD variation is has-a behavior.",
        core: "Use inheritance for true subtype relationships. Use composition for swappable rules and capabilities.",
        deepDive: "Car can be a Vehicle, but CarWithWeekendFeeAndElectricCharging is a smell. Fee, charging, reservation, and display behavior should be collaborators or policies.",
        concepts: [
          card("Inheritance", "Child must honor parent contract."),
          card("Composition", "Object delegates to collaborators."),
          card("Subclass explosion", "Many classes for combinations of features."),
          card("Testing", "Composition makes fake dependencies easy.")
        ],
        examples: [
          card("Vehicle", "Bike, Car, Truck can be simple subtypes."),
          card("Pricing", "FeePolicy should be composed, not inherited."),
          card("Elevator", "DispatchStrategy should be composed into controller.")
        ],
        flow: ["Ask is-a", "Check substitutability", "Find independent variation", "Prefer composition for policies", "Keep hierarchy shallow"],
        tradeoffs: [
          card("Inheritance", "Simple for stable taxonomy; rigid for variation."),
          card("Composition", "Flexible and testable; can add constructor dependencies."),
          card("Rule", "Use inheritance for identity, composition for behavior.")
        ],
        failures: ["Using inheritance for code reuse only.", "Child throws UnsupportedOperationException.", "Many subclasses for feature combinations."],
        useWhen: ["Inheritance: true is-a. Composition: policies, providers, strategies, optional behavior."],
        avoidWhen: ["Avoid deep inheritance trees in interviews."],
        codeTitle: "Composition over subclass explosion",
        code: strategyCode,
        questions: [
          q("EASY", "What does composition mean?", "An object owns collaborators and delegates behavior to them."),
          q("MEDIUM", "What is subclass explosion?", "Many subclasses are created for combinations of independent features."),
          q("HARD", "How does composition help tests?", "You can inject fake policies, gateways, and repositories.")
        ],
        revision: "Inheritance for is-a; composition for has-a behavior."
      }),
      lesson({
        id: "records-enums",
        name: "Records, Enums, and Value Objects",
        problem: "Primitive obsession makes invalid combinations easy: negative money, wrong seat format, reversed date ranges.",
        mentalModel: "A value object wraps a small concept and validates it once. Enums make fixed states explicit.",
        core: "Use records for immutable values and enums for fixed types or lifecycle states.",
        deepDive: "Money should not be a double. DateRange should not be two loose LocalDate parameters. SeatStatus should not be a string. These small choices make the model safer.",
        concepts: [
          card("Record", "Concise immutable value object."),
          card("Enum", "Closed set of states or types."),
          card("Validation", "Compact constructor rejects invalid values."),
          card("Minor units", "Store currency in paise or cents, not double.")
        ],
        examples: [
          card("Money", "currency + amountInPaise."),
          card("DateRange", "start + end with overlap logic."),
          card("SeatStatus", "AVAILABLE, LOCKED, BOOKED.")
        ],
        flow: ["Find primitive pair", "Name value object", "Validate constructor", "Use as parameter", "Avoid mutation"],
        tradeoffs: [
          card("Value object", "Safer and clearer APIs."),
          card("Extra type", "More classes, but better meaning."),
          card("Enum", "Great for fixed states; use State pattern if behavior differs heavily.")
        ],
        failures: ["Using double for money.", "Using String for status.", "No validation inside records."],
        useWhen: ["Money, IDs, seat numbers, coordinates, ranges, statuses."],
        avoidWhen: ["Avoid wrapping every trivial primitive without domain meaning."],
        codeTitle: "Value object record",
        code: `record Money(String currency, long amountInPaise) {
    Money {
        if (currency == null || currency.isBlank()) throw new IllegalArgumentException("Currency required");
        if (amountInPaise < 0) throw new IllegalArgumentException("Amount cannot be negative");
    }
}`,
        questions: [
          q("EASY", "Why use records?", "They are concise immutable value objects with built-in equality."),
          q("MEDIUM", "Why avoid double for money?", "Floating point precision can create incorrect financial calculations."),
          q("HARD", "Enum vs State pattern?", "Use enum for labels and simple guards; use State pattern when each state has different behavior.")
        ],
        revision: "Value objects make invalid primitive combinations harder."
      })
    ]),
    topic("w1d2", 1, 2, "Object Discovery and UML", "Turn vague prompts into classes, relationships, and diagrams.", [
      lesson({
        id: "nouns-verbs",
        name: "Nouns, Verbs, and Responsibilities",
        problem: "Beginners either create too many classes from nouns or too few classes because everything becomes a service.",
        mentalModel: "Nouns are candidates. Verbs reveal behavior. Responsibilities decide which candidates survive.",
        core: "Actor, entity, value object, service, policy, gateway, and repository are different roles.",
        deepDive: "Do not mechanically convert every noun into a class. A noun becomes a class when it owns state, lifecycle, behavior, validation, or a boundary.",
        concepts: [
          card("Actor", "External person or system triggering use cases."),
          card("Entity", "Identity and lifecycle over time."),
          card("Value object", "Equality by values, usually immutable."),
          card("Service", "Coordinates workflow across objects.")
        ],
        examples: [
          card("BookMyShow", "User, Show, ShowSeat, Booking, Payment are classes; button and page are UI details."),
          card("Splitwise", "Expense and Split are domain objects; BalanceService derives view data."),
          card("Cache", "Key and value may be generic types; EvictionPolicy owns variation.")
        ],
        flow: ["Underline nouns", "Circle verbs", "Group data", "Assign behavior", "Remove UI words", "Name boundaries"],
        tradeoffs: [
          card("More classes", "Clearer responsibilities but more navigation."),
          card("Fewer classes", "Quicker first pass but can become god objects."),
          card("Rule", "Keep classes that protect rules or simplify change.")
        ],
        failures: ["Class for every noun.", "One Manager for every verb.", "No distinction between physical object and per-use state."],
        useWhen: ["Starting any unknown LLD prompt."],
        avoidWhen: ["Do not stop at noun extraction; finish responsibility assignment."],
        codeTitle: "Object discovery notes",
        code: `// Prompt: user books selected seats for a movie show
// Actors: User, PaymentGateway
// Entities: Show, Seat, ShowSeat, Booking
// Services: BookingService, SeatLockService
// Value objects: Money, SeatNumber, TimeRange`,
        questions: [
          q("EASY", "Are all nouns classes?", "No. Some are fields, UI details, or external systems."),
          q("MEDIUM", "How do verbs help?", "They become methods or services: book, lock, pay, cancel, release."),
          q("HARD", "How do you avoid an anemic model?", "Assign behavior to the object that owns the invariant.")
        ],
        revision: "Nouns suggest objects; responsibilities decide objects."
      }),
      lesson({
        id: "relationships",
        name: "Association, Aggregation, Composition",
        problem: "Many class diagrams show lines but do not explain ownership or lifecycle.",
        mentalModel: "A relationship line should answer: who knows whom, who owns whom, and what happens when the parent disappears.",
        core: "Association means knows. Aggregation means has but independent lifecycle. Composition means owns lifecycle.",
        deepDive: "Interviewers care less about perfect UML notation and more about whether you understand ownership. If ParkingLot composes floors, deleting the lot deletes floors in that model.",
        concepts: [
          card("Association", "A uses or knows B."),
          card("Aggregation", "A has B, but B can live independently."),
          card("Composition", "A owns B lifecycle."),
          card("Dependency", "A temporarily uses B as a method parameter.")
        ],
        examples: [
          card("Order and Product", "Order aggregates Product; Product exists without one order."),
          card("ParkingLot and Floor", "Lot composes floors in an interview model."),
          card("BookingService and PaymentGateway", "Service depends on gateway interface.")
        ],
        flow: ["List classes", "Ask lifecycle", "Choose relationship", "Draw line", "Explain ownership"],
        tradeoffs: [
          card("Composition", "Clear ownership; less reuse."),
          card("Aggregation", "Reusable parts; weaker ownership."),
          card("Association", "Simple reference; avoid implying lifecycle.")
        ],
        failures: ["Using composition everywhere.", "Not explaining multiplicity.", "Confusing database foreign keys with domain ownership."],
        useWhen: ["Class diagram discussion."],
        avoidWhen: ["Do not obsess over UML symbols at the cost of behavior."],
        codeTitle: "Relationship shape in Java",
        code: `final class ParkingLot {
    private final List<ParkingFloor> floors; // composition in this model
}

final class CheckoutService {
    PaymentReceipt checkout(Order order, PaymentMethod paymentMethod) {
        return paymentMethod.pay(order.total()); // dependency
    }
}`,
        questions: [
          q("EASY", "What is composition?", "A strong whole-part relationship where the whole owns the part lifecycle."),
          q("MEDIUM", "How do you show multiplicity?", "Explain one-to-one, one-to-many, or many-to-many relationships in words or notation."),
          q("HARD", "Should domain relationships equal database relationships?", "Not always. Domain ownership and database storage can differ.")
        ],
        revision: "Every diagram line should explain knowledge, ownership, or lifecycle."
      }),
      lesson({
        id: "sequence-diagram",
        name: "Sequence Diagrams",
        problem: "Class diagrams show structure but not runtime collaboration. Many LLD bugs hide in the runtime flow.",
        mentalModel: "A sequence diagram is the movie version of your design: who calls whom, in what order, and what happens on failure.",
        core: "Use sequence diagrams for booking, payment, seat locking, cache put, elevator request, and order checkout.",
        deepDive: "A strong sequence diagram names the service boundary, lock boundary, and external call boundary. This helps you avoid holding locks during network calls.",
        concepts: [
          card("Participant", "Actor, service, entity, gateway."),
          card("Call", "Method invocation or message."),
          card("Return", "Result or exception."),
          card("Compensation", "Undo or release when later step fails.")
        ],
        examples: [
          card("BookMyShow", "User -> BookingService -> SeatLockService -> PaymentGateway -> Booking."),
          card("Shopping cart", "Checkout -> reserve inventory -> pay -> create order -> release on failure."),
          card("Notification", "Publisher -> queue -> sender -> provider adapter.")
        ],
        flow: ["Actor sends command", "Service validates", "Entities change state", "Gateway called", "Success or compensation"],
        tradeoffs: [
          card("Detailed flow", "Finds failure paths early."),
          card("Too detailed", "Can waste time on trivial getters."),
          card("Rule", "Diagram the central state-changing flow.")
        ],
        failures: ["External call hidden inside entity.", "No payment failure branch.", "No retry or duplicate handling."],
        useWhen: ["Any workflow that spans multiple objects."],
        avoidWhen: ["Do not draw sequence diagrams for simple value object methods."],
        codeTitle: "Sequence as comments",
        code: `// confirmBooking:
// 1. validate selected seats
// 2. lock seats
// 3. create pending booking
// 4. charge payment
// 5. confirm booking or release locks`,
        questions: [
          q("EASY", "When should you draw a sequence diagram?", "When explaining runtime collaboration across multiple objects."),
          q("MEDIUM", "What should failure branches show?", "Which state is rolled back, released, retried, or marked failed."),
          q("HARD", "Why show external calls separately?", "They are slow and unreliable; they affect lock scope and retry design.")
        ],
        revision: "Sequence diagram = runtime proof of your design."
      }),
      lesson({
        id: "state-diagram",
        name: "State Diagrams",
        problem: "Status fields become bugs when any code can move an object to any state.",
        mentalModel: "A state diagram is a whitelist of allowed transitions.",
        core: "Use it for Booking, Payment, Order, SeatLock, VendingMachine, Task, Elevator, and Game.",
        deepDive: "If the same command behaves differently in different states, consider the State pattern. If states only validate transitions, enum plus guard methods is enough.",
        concepts: [
          card("State", "Named lifecycle condition."),
          card("Transition", "Allowed movement caused by an event."),
          card("Terminal state", "Usually no further normal movement."),
          card("Idempotency", "Repeated event should not duplicate side effects.")
        ],
        examples: [
          card("Seat", "AVAILABLE -> LOCKED -> BOOKED, or LOCKED -> AVAILABLE on expiry."),
          card("Order", "CREATED -> PAID -> SHIPPED -> DELIVERED."),
          card("Task", "QUEUED -> RUNNING -> SUCCEEDED or FAILED.")
        ],
        flow: ["List statuses", "List events", "Draw allowed transitions", "Reject invalid transitions", "Handle duplicate events"],
        tradeoffs: [
          card("Enum", "Simple, readable, enough for many interviews."),
          card("State pattern", "Better when behavior differs heavily by state."),
          card("Transition table", "Useful for complex workflows.")
        ],
        failures: ["String status.", "Public setStatus.", "No duplicate callback handling."],
        useWhen: ["Lifecycle-heavy objects."],
        avoidWhen: ["Stateless services or simple calculations."],
        codeTitle: "State guard",
        code: `void confirm() {
    if (status == BookingStatus.CONFIRMED) return; // duplicate callback
    if (status != BookingStatus.PENDING) throw new IllegalStateException("Invalid transition");
    status = BookingStatus.CONFIRMED;
}`,
        questions: [
          q("EASY", "What is a state transition?", "A valid movement from one state to another caused by an event."),
          q("MEDIUM", "Why avoid public setStatus?", "It bypasses transition rules and allows impossible states."),
          q("HARD", "How do duplicate callbacks affect state?", "Transitions must be idempotent or reject repeated events safely.")
        ],
        revision: "State diagrams define legal lifecycle paths."
      })
    ])
  ];

  const solidAndPatterns = [
    topic("w2d3", 2, 3, "SOLID Principles", "Use SOLID as practical design reasoning, not memorized definitions.", [
      principleLesson("Single Responsibility Principle", "A class should have one reason to change.", "one class owns unrelated rules", "focused classes with clear responsibilities", `final class Invoice {}
final class TaxCalculator {}
final class InvoicePdfRenderer {}
final class InvoiceEmailSender {}`),
      principleLesson("Open Closed Principle", "Add new behavior by extension rather than editing stable code.", "new rule requires editing a central switch", "interface plus new implementation", strategyCode),
      principleLesson("Liskov Substitution Principle", "Subtypes must be usable wherever the parent type is expected.", "child cannot support parent behavior", "split hierarchy or use capability interfaces", `interface Flyable {
    void fly();
}

final class Sparrow implements Flyable {
    public void fly() {}
}`),
      principleLesson("Interface Segregation Principle", "Clients should not depend on methods they do not use.", "fat interface forces empty methods", "small role-specific interfaces", `interface Printable { void print(Document document); }
interface Scannable { Scan scan(); }
interface Faxable { void fax(Number number); }`),
      principleLesson("Dependency Inversion Principle", "High-level modules should depend on abstractions, not concrete details.", "service directly creates vendor client", "inject a gateway interface", `interface PaymentGateway {
    PaymentReceipt charge(Money amount);
}

final class BookingService {
    private final PaymentGateway paymentGateway;
}`)
    ]),
    topic("w2d4", 2, 4, "Design Patterns for LLD", "Know the patterns that repeatedly appear in Java LLD interviews.", [
      patternLesson("Strategy Pattern", "algorithms or business rules vary", [["Parking", "FeePolicy"], ["Splitwise", "SplitStrategy"], ["Elevator", "DispatchStrategy"], ["Cache", "EvictionPolicy"]], strategyCode),
      patternLesson("Factory Pattern", "caller should not know which concrete class to create", [["Notification", "Create EmailSender or SmsSender from channel"], ["Vehicle", "Create Bike, Car, Truck from input"], ["Payment", "Create method from selected mode"]], `final class PaymentFactory {
    static PaymentMethod create(PaymentMode mode) {
        return switch (mode) {
            case UPI -> new UpiPayment();
            case CARD -> new CardPayment();
        };
    }
}`),
      patternLesson("Builder Pattern", "object construction has many fields or validation steps", [["Booking", "user, show, seats, amount, status"], ["Order", "items, address, payment, discount"], ["UserProfile", "optional profile fields"]], `Booking booking = Booking.builder()
    .user(user)
    .show(show)
    .seats(seats)
    .amount(amount)
    .build();`),
      patternLesson("Observer Pattern", "many listeners react to one domain event", [["Booking", "Send email, push, analytics after confirmation"], ["Splitwise", "Notify group when expense is added"], ["Inventory", "Alert when stock is low"]], `interface BookingListener {
    void onConfirmed(Booking booking);
}`),
      patternLesson("State Pattern", "same command behaves differently depending on lifecycle state", [["Vending Machine", "selectItem in IDLE differs from HAS_MONEY"], ["Order", "cancel behaves differently after shipping"], ["Payment", "callback behavior changes by status"]], `interface MachineState {
    void insertCoin(VendingMachine machine, Coin coin);
    void selectItem(VendingMachine machine, String code);
}`)
    ]),
    topic("w2d5", 2, 5, "Advanced Pattern Choices", "Choose patterns by design pressure and explain trade-offs.", [
      patternLesson("Command Pattern", "actions must be queued, retried, audited, scheduled, or undone", [["Task Scheduler", "Task is a command"], ["Elevator", "Hall request as command"], ["Editor", "Undo and redo"]], `interface Command {
    void execute();
}

final class ElevatorRequestCommand implements Command {
    public void execute() {
        // assign elevator
    }
}`),
      patternLesson("Adapter Pattern", "external API shape does not match your internal interface", [["Payment", "Razorpay SDK behind PaymentGateway"], ["Maps", "Google Maps behind DistanceProvider"], ["SMS", "Vendor SDK behind ChannelSender"]], `final class RazorpayAdapter implements PaymentGateway {
    private final RazorpayClient client;

    public PaymentReceipt charge(Money amount) {
        return client.createPayment(amount.amountInPaise());
    }
}`),
      patternLesson("Decorator Pattern", "optional behavior wraps an existing object", [["Notification", "Retrying sender wraps EmailSender"], ["Gateway", "Logging gateway wraps PaymentGateway"], ["Repository", "Caching repository wraps real repository"]], `final class RetryingSender implements NotificationSender {
    private final NotificationSender delegate;

    public void send(Notification n) {
        // retry delegate.send(n)
    }
}`),
      patternLesson("Repository Pattern", "domain logic should not know persistence details", [["Booking", "BookingRepository hides DB"], ["Expense", "ExpenseRepository hides storage"], ["Seat lock", "SeatLockStore can be in-memory or Redis"]], `interface BookingRepository {
    void save(Booking booking);
    Optional<Booking> findById(String id);
}`),
      patternLesson("Template Method Pattern", "a workflow has fixed steps but some steps vary", [["Game", "common turn flow, different validation"], ["Import job", "parse, validate, persist, report"], ["Payment", "pre-check, execute, post-process"]], `abstract class ImportJob {
    final void run() {
        parse();
        validate();
        persist();
    }
    abstract void parse();
    abstract void validate();
    abstract void persist();
}`)
    ])
  ];

  const toolkit = [
    topic("w3d6", 3, 6, "Java Implementation Toolkit", "Write interview Java that is small, safe, and explainable.", [
      lesson({
        id: "collections",
        name: "Collections and Data Structures",
        problem: "Many LLD problems are won by choosing the right collection before writing classes.",
        mentalModel: "Collections are part of the design, not an implementation afterthought.",
        core: "Use Map for lookup, Queue for turn/order, PriorityQueue for scheduling, Set for uniqueness, List for ordered collections.",
        deepDive: "Explain complexity in the context of the workflow: Cache get should be O(1), scheduler next task should be O(log n), board lookup can be O(1).",
        concepts: [card("HashMap", "Fast key lookup."), card("Queue", "Turn order or async processing."), card("PriorityQueue", "Earliest deadline or highest priority."), card("Set", "Uniqueness.")],
        examples: [card("LRU cache", "HashMap plus doubly linked list."), card("Snake and Ladder", "Queue of players."), card("Task scheduler", "PriorityQueue by runAt time.")],
        flow: ["List operations", "Pick complexity target", "Choose collection", "Wrap behind domain class"],
        tradeoffs: [card("HashMap", "Fast lookup, no ordering."), card("TreeMap", "Sorted keys, O(log n)."), card("PriorityQueue", "Fast min or max, no arbitrary removal.")],
        failures: ["Linear scan where O(1) lookup is expected.", "Exposing mutable collection internals.", "Using List when uniqueness matters."],
        useWhen: ["Every implementation round."],
        avoidWhen: ["Do not over-optimize if simple list is enough for interview scope."],
        codeTitle: "Collection choice",
        code: `final class Inventory {
    private final Map<String, Integer> stockBySku = new HashMap<>();

    boolean hasStock(String sku, int quantity) {
        return stockBySku.getOrDefault(sku, 0) >= quantity;
    }
}`,
        questions: [q("EASY", "When do you use Map?", "When you need fast lookup by key."), q("MEDIUM", "What does PriorityQueue give you?", "Efficient access to the next smallest or largest item."), q("HARD", "How do you make collection access safe?", "Keep collections private and expose domain methods or immutable views.")],
        revision: "Pick collections from operation needs."
      }),
      lesson({
        id: "exceptions-results",
        name: "Exceptions, Result Objects, and Validation",
        problem: "If failures are unclear, the design looks optimistic and non-production-ready.",
        mentalModel: "Invalid commands should fail loudly; normal absence should be represented cleanly.",
        core: "Use exceptions for invalid commands, Optional for normal absence, and result objects for external operations with status.",
        deepDive: "Payment failure is not the same as an invalid seat transition. Payment can return a failed receipt; trying to book an already booked seat should reject the command.",
        concepts: [card("Exception", "Business rule violated."), card("Optional", "Normal absence."), card("Result object", "External operation can succeed or fail."), card("Validation", "Protect invariants at boundaries.")],
        examples: [card("No spot", "Optional<ParkingSpot> is reasonable."), card("Seat booked", "Throw SeatUnavailableException."), card("Payment", "PaymentResult with status and provider reference.")],
        flow: ["Validate input", "Check state", "Return result or throw", "Keep domain consistent"],
        tradeoffs: [card("Exceptions", "Clear failure but must not be used for normal control flow."), card("Optional", "Clear absence but not for invalid commands."), card("Result", "Good for provider failures and reasons.")],
        failures: ["Returning null.", "Swallowing provider failure.", "Throwing generic RuntimeException everywhere."],
        useWhen: ["Every command method."],
        avoidWhen: ["Do not model all failures as strings."],
        codeTitle: "Failure modeling",
        code: `record PaymentResult(PaymentStatus status, String providerRef, String reason) {}

Optional<ParkingSpot> findSpot(Vehicle vehicle) {
    return spots.stream().filter(s -> s.canFit(vehicle)).findFirst();
}`,
        questions: [q("EASY", "When is Optional useful?", "When absence is normal, such as no available spot."), q("MEDIUM", "When should you throw?", "When the caller asks for an invalid state change."), q("HARD", "How do provider errors differ from domain errors?", "Provider errors often return status/reason; domain errors violate rules inside your system.")],
        revision: "Model absence, invalid command, and external failure differently."
      }),
      lesson({
        id: "thread-safety",
        name: "Thread Safety Basics",
        problem: "A design that works for one user may break when two users act at the same time.",
        mentalModel: "Find shared state, then make check-plus-update atomic.",
        core: "Use synchronized, locks, transactions, atomic classes, or database constraints depending on where the shared state lives.",
        deepDive: "BookMyShow, Parking Lot, Cache, Rate Limiter, and Task Scheduler all have shared state. Name the shared resource and the atomic operation.",
        concepts: [card("Shared resource", "Seat, spot, token bucket, cache map."), card("Critical section", "Check and update together."), card("Atomicity", "No interleaving breaks invariant."), card("Lock scope", "Keep small; avoid external calls inside locks.")],
        examples: [card("Seat lock", "Check AVAILABLE and mark LOCKED atomically."), card("Parking spot", "Find and assign spot atomically."), card("Rate limiter", "Refill and consume token atomically.")],
        flow: ["Identify shared state", "Identify invariant", "Group check and update", "Choose lock boundary", "Test race"],
        tradeoffs: [card("synchronized", "Simple in-memory lock."), card("Database transaction", "Correct for persistent shared state."), card("Redis/Lua", "Atomic distributed counter or limiter.")],
        failures: ["Check availability outside lock.", "Hold lock during payment call.", "Assume ConcurrentHashMap solves multi-step invariants."],
        useWhen: ["Multiple threads or users can update same object."],
        avoidWhen: ["Do not add locks around read-only immutable data."],
        codeTitle: "Atomic section",
        code: `synchronized boolean tryLockSeat(String seatId) {
    ShowSeat seat = seats.get(seatId);
    if (seat.status() != SeatStatus.AVAILABLE) return false;
    seat.lock();
    return true;
}`,
        questions: [q("EASY", "What is a race condition?", "Outcome depends on timing of concurrent operations."), q("MEDIUM", "What is check-plus-update?", "Reading state, checking condition, then writing new state as one atomic unit."), q("HARD", "Why avoid external calls inside locks?", "They are slow and unreliable, increasing contention and failure impact.")],
        revision: "Shared state needs atomic check-plus-update."
      })
    ])
  ];

  const caseSpecs = [
    {
      id: "w4d7-parking", week: 4, day: 7, title: "Parking Lot", goal: "Classic SDE1 LLD with tickets, spots, gates, and fee policies.", actors: ["Driver", "EntryGate", "ExitGate"], entities: ["ParkingLot", "ParkingFloor", "ParkingSpot", "Vehicle", "Ticket", "FeePolicy", "Payment"], states: ["SPOT_FREE", "SPOT_OCCUPIED", "TICKET_ACTIVE", "TICKET_PAID"], patterns: ["Strategy", "Factory", "Observer"], mainStory: "Driver enters, receives a ticket, parks, pays on exit, and the spot becomes free.", invariant: "A spot can be assigned to at most one active vehicle.", failure: "No compatible spot is available or payment fails during exit.", techAnalogy: "Resource allocation with capacity and release.", valueObject: "Money and VehicleNumber.", flow: ["Vehicle enters", "Find compatible spot", "Create ticket", "Park vehicle", "Calculate fee", "Take payment", "Release spot"], extensions: ["Nearest spot allocation", "EV charging spots", "Display board", "Reserved spots"], firstMethod: "EntryGate.park(vehicle)", race: "Two entry gates assigning the same spot.", workflowCode: `interface SpotAllocator {
    Optional<ParkingSpot> findSpot(Vehicle vehicle);
}

final class EntryGate {
    private final SpotAllocator allocator;

    Ticket park(Vehicle vehicle) {
        ParkingSpot spot = allocator.findSpot(vehicle)
                .orElseThrow(() -> new IllegalStateException("No spot"));
        spot.park(vehicle);
        return Ticket.active(vehicle, spot);
    }
}`, modelCode: `final class ParkingSpot {
    private final SpotType type;
    private Vehicle vehicle;

    boolean canFit(Vehicle candidate) {
        return vehicle == null && type.supports(candidate.type());
    }

    void park(Vehicle candidate) {
        if (!canFit(candidate)) throw new IllegalStateException("Cannot park");
        vehicle = candidate;
    }
}`
    },
    {
      id: "w4d8-vending", week: 4, day: 8, title: "Vending Machine", goal: "State-heavy design with money, inventory, dispensing, and refund.", actors: ["Customer", "Operator"], entities: ["VendingMachine", "Inventory", "Slot", "Item", "Coin", "CashRegister", "MachineState"], states: ["IDLE", "HAS_MONEY", "DISPENSING", "OUT_OF_SERVICE"], patterns: ["State", "Strategy", "Factory"], mainStory: "Customer inserts money, selects item, machine validates stock and credit, dispenses item, returns change.", invariant: "Machine must not dispense unless stock exists and inserted credit covers price.", failure: "Selected item is out of stock or exact change cannot be returned.", techAnalogy: "A finite state machine with inventory and payment validation.", valueObject: "Coin and Money.", flow: ["Idle", "Insert money", "Select item", "Validate stock", "Dispense", "Return change", "Idle"], extensions: ["Exact change mode", "Card payment", "Operator refill", "Maintenance mode"], firstMethod: "VendingMachine.selectItem(code)", race: "Two customers are not expected on one physical machine, but operator refill can conflict with purchase.", workflowCode: `final class VendingMachine {
    private MachineStatus status = MachineStatus.IDLE;
    private long credit;
    private final Inventory inventory;

    Item select(String code) {
        Item item = inventory.item(code);
        if (credit < item.price()) throw new IllegalStateException("Insufficient credit");
        inventory.decrease(code);
        credit -= item.price();
        status = MachineStatus.IDLE;
        return item;
    }
}`
    },
    {
      id: "w4d9-library", week: 4, day: 9, title: "Library Management", goal: "Model books, physical copies, loans, reservations, and fines.", actors: ["Member", "Librarian"], entities: ["Book", "BookCopy", "Member", "Loan", "Reservation", "FinePolicy", "Catalog"], states: ["AVAILABLE", "BORROWED", "RESERVED", "LOST"], patterns: ["Repository", "Strategy", "Factory"], mainStory: "Member searches a book, borrows an available copy, returns it, and fine is calculated if late.", invariant: "A physical BookCopy can have only one active loan.", failure: "No copy is available or member has exceeded borrowing limit.", techAnalogy: "Inventory with item copies and time-bound ownership.", valueObject: "ISBN, Barcode, DateRange.", flow: ["Search", "Pick copy", "Check eligibility", "Create loan", "Return copy", "Calculate fine", "Close loan"], extensions: ["Reservation queue", "Different member limits", "Multi-branch library", "Lost book handling"], firstMethod: "LoanService.issue(copy, member)", race: "Two librarians issuing the same copy.", workflowCode: `final class BookCopy {
    private CopyStatus status = CopyStatus.AVAILABLE;

    void issueTo(Member member) {
        if (status != CopyStatus.AVAILABLE) throw new IllegalStateException("Copy unavailable");
        status = CopyStatus.BORROWED;
    }
}`
    },
    {
      id: "w5d10-elevator", week: 5, day: 10, title: "Elevator System", goal: "SDE2 classic with requests, dispatch strategy, states, and fairness.", actors: ["Passenger", "ElevatorController"], entities: ["ElevatorCar", "HallRequest", "CarRequest", "DispatchStrategy", "Door", "Floor"], states: ["IDLE", "MOVING_UP", "MOVING_DOWN", "DOOR_OPEN", "MAINTENANCE"], patterns: ["Strategy", "State", "Command"], mainStory: "Passenger requests an elevator; controller selects a car; car moves, opens door, and completes stop.", invariant: "An elevator should not move with doors open and should not accept impossible floor requests.", failure: "No elevator is available or emergency/maintenance mode overrides normal dispatch.", techAnalogy: "Task scheduling with moving workers and direction constraints.", valueObject: "FloorNumber.", flow: ["Hall request", "Score elevators", "Assign car", "Add stop", "Move", "Open door", "Complete request"], extensions: ["Nearest car", "Same direction dispatch", "Emergency mode", "Capacity-aware dispatch"], firstMethod: "ElevatorController.handle(request)", race: "Many hall requests assigning the same elevator concurrently.", workflowCode: `interface DispatchStrategy {
    ElevatorCar select(List<ElevatorCar> cars, HallRequest request);
}

final class ElevatorController {
    private final DispatchStrategy strategy;

    void handle(HallRequest request) {
        ElevatorCar car = strategy.select(cars, request);
        car.addStop(request.floor());
    }
}`
    },
    {
      id: "w5d11-splitwise", week: 5, day: 11, title: "Splitwise", goal: "Expense splitting, balances, settlements, and debt simplification.", actors: ["User", "Group"], entities: ["User", "Group", "Expense", "Split", "BalanceSheet", "Settlement", "SplitStrategy"], states: ["EXPENSE_ACTIVE", "SETTLED", "DELETED"], patterns: ["Strategy", "Repository", "Factory"], mainStory: "A user adds an expense, splits are validated, balances update, and users settle debts later.", invariant: "For every expense, sum of split amounts must equal paid amount.", failure: "Exact splits do not sum to total or percentage splits do not sum to 100.", techAnalogy: "Ledger entries with derived balances.", valueObject: "Money.", flow: ["Add expense", "Calculate splits", "Validate totals", "Create ledger entries", "Update balances", "Settle"], extensions: ["Equal split", "Exact split", "Percentage split", "Debt simplification"], firstMethod: "ExpenseService.addExpense(request)", race: "Two settlements updating the same balance pair.", workflowCode: `interface SplitStrategy {
    List<Split> calculate(Money total, List<User> users);
}

final class ExpenseService {
    Expense addExpense(User payer, Money total, SplitStrategy strategy, List<User> users) {
        List<Split> splits = strategy.calculate(total, users);
        validate(total, splits);
        return new Expense(payer, total, splits);
    }
}`
    },
    {
      id: "w5d12-bookmyshow", week: 5, day: 12, title: "BookMyShow", goal: "Seat inventory, temporary locks, payment, and double-booking prevention.", actors: ["Customer", "PaymentGateway"], entities: ["Movie", "Theater", "Screen", "Show", "Seat", "ShowSeat", "SeatLock", "Booking", "Payment"], states: ["AVAILABLE", "LOCKED", "BOOKED", "EXPIRED"], patterns: ["State", "Strategy", "Repository", "Adapter"], mainStory: "Customer selects seats for a show, seats are locked, payment succeeds, and booking is confirmed.", invariant: "A show seat can never be confirmed by two bookings.", failure: "Payment fails, lock expires, or another user already locked the seat.", techAnalogy: "Distributed lock plus transactional reservation.", valueObject: "SeatNumber, Money, TimeRange.", flow: ["Search show", "Select seats", "Lock seats", "Create pending booking", "Pay", "Confirm seats", "Release on failure"], extensions: ["Lock expiry", "Idempotent payment callback", "Seat categories", "Cancellation"], firstMethod: "BookingService.lockAndCreatePendingBooking()", race: "Two users locking the same show seat.", workflowCode: `final class ShowSeat {
    private SeatStatus status = SeatStatus.AVAILABLE;

    void lock() {
        if (status != SeatStatus.AVAILABLE) throw new IllegalStateException("Seat unavailable");
        status = SeatStatus.LOCKED;
    }

    void confirm() {
        if (status != SeatStatus.LOCKED) throw new IllegalStateException("Seat not locked");
        status = SeatStatus.BOOKED;
    }
}`
    },
    {
      id: "w6d13-cache", week: 6, day: 13, title: "In-Memory Cache", goal: "Generic cache with eviction policies, TTL, and thread safety.", actors: ["Client", "Cache"], entities: ["Cache", "CacheEntry", "EvictionPolicy", "Storage", "Clock"], states: ["PRESENT", "EXPIRED", "EVICTED"], patterns: ["Strategy", "Decorator", "Factory"], mainStory: "Client puts and gets values; when capacity is full, policy chooses which key to evict.", invariant: "Cache size must not exceed configured capacity.", failure: "Concurrent put/get corrupts eviction metadata or expired entries are returned.", techAnalogy: "Memory-constrained key-value store.", valueObject: "CacheKey, Duration.", flow: ["put", "Check capacity", "Evict if needed", "Store entry", "get", "Check expiry", "Update policy"], extensions: ["LRU", "LFU", "TTL", "Thread-safe cache"], firstMethod: "Cache.put(key, value)", race: "Concurrent writes and eviction policy updates.", workflowCode: `final class Cache<K, V> {
    private final int capacity;
    private final Map<K, V> store = new HashMap<>();
    private final EvictionPolicy<K> policy;

    synchronized void put(K key, V value) {
        if (store.size() == capacity && !store.containsKey(key)) {
            store.remove(policy.evictKey());
        }
        store.put(key, value);
        policy.keyAccessed(key);
    }
}`
    },
    {
      id: "w6d14-rate-limiter", week: 6, day: 14, title: "Rate Limiter", goal: "Protect APIs with fixed window, sliding window, token bucket, and distributed counters.", actors: ["Client", "API Gateway"], entities: ["RateLimiter", "LimitRule", "Bucket", "WindowCounter", "Clock", "RateLimitKey"], states: ["ALLOWED", "REJECTED", "THROTTLED"], patterns: ["Strategy", "Factory", "Repository"], mainStory: "Each request is checked against a per-user or per-IP limit before reaching the service.", invariant: "A client must not exceed its allowed request budget for the configured rule.", failure: "Fixed window boundary burst or non-atomic distributed counter.", techAnalogy: "Traffic shaping and overload protection.", valueObject: "RateLimitKey, Duration.", flow: ["Request arrives", "Build key", "Load state", "Refill or count", "Allow or reject", "Update state"], extensions: ["Token bucket", "Sliding window", "Distributed Redis limiter", "Per-plan limits"], firstMethod: "RateLimiter.allow(key)", race: "Many API servers updating the same counter.", workflowCode: `final class TokenBucket {
    private final long capacity;
    private long tokens;
    private long lastRefillMillis;

    synchronized boolean allow() {
        refill();
        if (tokens == 0) return false;
        tokens--;
        return true;
    }
}`
    },
    {
      id: "w6d15-task-scheduler", week: 6, day: 15, title: "Task Scheduler", goal: "Schedule jobs with queues, workers, retries, priorities, and execution states.", actors: ["Client", "Worker"], entities: ["Task", "Schedule", "TaskQueue", "Worker", "RetryPolicy", "Execution"], states: ["CREATED", "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "RETRYING"], patterns: ["Command", "Strategy", "State"], mainStory: "Client schedules a task; scheduler enqueues it; worker executes; task succeeds or retries.", invariant: "A task should not be executed by two workers at the same time.", failure: "Worker crashes after taking task but before marking result.", techAnalogy: "Durable command queue with visibility timeout.", valueObject: "RunAtTime, Priority.", flow: ["Create task", "Calculate run time", "Enqueue", "Worker leases task", "Execute", "Complete or retry"], extensions: ["Cron", "Priority queue", "Retry backoff", "Dead letter queue"], firstMethod: "Worker.pollAndRun()", race: "Two workers leasing the same task.", workflowCode: `final class ScheduledTask {
    private TaskStatus status = TaskStatus.CREATED;
    private int attempts;

    void start() {
        if (status != TaskStatus.QUEUED && status != TaskStatus.RETRYING) {
            throw new IllegalStateException("Task not ready");
        }
        attempts++;
        status = TaskStatus.RUNNING;
    }
}`
    },
    {
      id: "w7d16-food", week: 7, day: 16, title: "Food Delivery", goal: "Order lifecycle, restaurant acceptance, partner assignment, payment, and cancellation.", actors: ["Customer", "Restaurant", "DeliveryPartner"], entities: ["Restaurant", "MenuItem", "Cart", "Order", "Payment", "DeliveryAssignment", "Partner"], states: ["CREATED", "PAID", "ACCEPTED", "PREPARING", "PICKED_UP", "DELIVERED", "CANCELLED"], patterns: ["State", "Strategy", "Observer", "Adapter"], mainStory: "Customer places order, pays, restaurant accepts, partner delivers, order completes.", invariant: "Order state must stay consistent across payment, restaurant acceptance, delivery, and cancellation.", failure: "Payment succeeds but restaurant rejects, or delivery partner assignment fails.", techAnalogy: "Multi-party workflow with state transitions and compensation.", valueObject: "Money, Address, ETA.", flow: ["Add items", "Place order", "Pay", "Restaurant accepts", "Assign partner", "Pick up", "Deliver"], extensions: ["Coupons", "Surge delivery fee", "Partner assignment", "Refund policy"], firstMethod: "OrderService.placeOrder(cart)", race: "Cancellation and acceptance arriving at the same time.", workflowCode: `final class Order {
    private OrderStatus status = OrderStatus.CREATED;

    void markPaid(PaymentReceipt receipt) {
        if (status != OrderStatus.CREATED) throw new IllegalStateException();
        if (receipt.status() != PaymentStatus.SUCCESS) throw new IllegalArgumentException();
        status = OrderStatus.PAID;
    }
}`
    },
    {
      id: "w7d17-ride", week: 7, day: 17, title: "Ride Sharing", goal: "Driver matching, trip lifecycle, pricing, cancellation, and location updates.", actors: ["Rider", "Driver", "MapProvider"], entities: ["Rider", "Driver", "RideRequest", "Trip", "Location", "Fare", "MatchingStrategy", "Payment"], states: ["REQUESTED", "ASSIGNED", "STARTED", "COMPLETED", "CANCELLED"], patterns: ["Strategy", "State", "Adapter", "Observer"], mainStory: "Rider requests ride; system matches driver; trip starts, ends, and rider is charged.", invariant: "A driver should not be assigned to two active trips at the same time.", failure: "Driver accepts but cancels or location data becomes stale.", techAnalogy: "Resource matching with geospatial scoring.", valueObject: "Location, Distance, Money.", flow: ["Request ride", "Find drivers", "Driver accepts", "Start trip", "Track route", "End trip", "Charge"], extensions: ["Surge pricing", "Vehicle types", "Scheduled rides", "Pooling"], firstMethod: "MatchingService.match(request)", race: "Two ride requests assigning the same driver.", workflowCode: `interface MatchingStrategy {
    Optional<Driver> match(RideRequest request, List<Driver> drivers);
}

final class NearestDriverStrategy implements MatchingStrategy {
    public Optional<Driver> match(RideRequest request, List<Driver> drivers) {
        return drivers.stream().filter(Driver::isAvailable)
                .min(Comparator.comparingDouble(d -> d.distanceFrom(request.pickup())));
    }
}`
    },
    {
      id: "w7d18-hotel", week: 7, day: 18, title: "Hotel Booking", goal: "Date-range inventory, temporary holds, payment, cancellation, and pricing.", actors: ["Guest", "HotelAdmin", "PaymentGateway"], entities: ["Hotel", "Room", "RoomType", "RoomInventory", "Booking", "DateRange", "CancellationPolicy"], states: ["HELD", "CONFIRMED", "CANCELLED", "EXPIRED"], patterns: ["Strategy", "State", "Repository"], mainStory: "Guest searches room for dates, inventory is held, payment confirms booking.", invariant: "A room or room inventory unit cannot be double-booked for overlapping dates.", failure: "Hold expires before payment or overlapping booking arrives concurrently.", techAnalogy: "Inventory reservation over a time interval.", valueObject: "DateRange, Money.", flow: ["Search", "Check inventory", "Hold room", "Pay", "Confirm booking", "Release on failure"], extensions: ["Dynamic pricing", "Cancellation policy", "Room upgrades", "Partial payment"], firstMethod: "BookingService.holdRoom(request)", race: "Two guests holding the last room for overlapping dates.", workflowCode: `record DateRange(LocalDate start, LocalDate end) {
    boolean overlaps(DateRange other) {
        return start.isBefore(other.end()) && other.start().isBefore(end);
    }
}`
    },
    {
      id: "w8d19-chess", week: 8, day: 19, title: "Chess", goal: "Piece movement, board model, validation, turns, check, and special moves.", actors: ["WhitePlayer", "BlackPlayer"], entities: ["Game", "Board", "Square", "Piece", "Move", "MoveValidator", "Player"], states: ["ACTIVE", "CHECK", "CHECKMATE", "STALEMATE", "RESIGNED"], patterns: ["Strategy", "Template Method", "Factory"], mainStory: "Player selects a piece, makes a legal move, capture/check is evaluated, and turn changes.", invariant: "A legal move must follow piece rules and must not leave own king in check.", failure: "Move is out of bounds, blocked, or exposes king.", techAnalogy: "Rule engine over a grid with polymorphic pieces.", valueObject: "SquareCoordinate.", flow: ["Select piece", "Validate turn", "Validate move", "Move piece", "Handle capture", "Check king", "Switch turn"], extensions: ["Castling", "En passant", "Promotion", "Undo move"], firstMethod: "Game.makeMove(move)", race: "Online game receives two moves from same player quickly.", workflowCode: `abstract class Piece {
    abstract boolean canMove(Board board, Square from, Square to);
}

final class Bishop extends Piece {
    boolean canMove(Board board, Square from, Square to) {
        return Math.abs(from.row() - to.row()) == Math.abs(from.col() - to.col())
                && board.pathClear(from, to);
    }
}`
    },
    {
      id: "w8d20-atm", week: 8, day: 20, title: "ATM", goal: "Card auth, account operations, cash denomination inventory, and transactions.", actors: ["Customer", "BankServer", "Operator"], entities: ["ATM", "Card", "Account", "Transaction", "CashDispenser", "CashInventory", "AuthService"], states: ["IDLE", "CARD_INSERTED", "AUTHENTICATED", "DISPENSING", "OUT_OF_CASH"], patterns: ["State", "Strategy", "Adapter"], mainStory: "Customer inserts card, authenticates, withdraws cash, and transaction is recorded.", invariant: "Cash is dispensed only if account balance and ATM cash inventory can satisfy the amount.", failure: "Bank approves but dispenser cannot produce exact denominations.", techAnalogy: "External authorization plus local resource inventory.", valueObject: "Money, Denomination.", flow: ["Insert card", "Authenticate", "Select amount", "Validate balance", "Select notes", "Dispense", "Record"], extensions: ["Deposit", "Transfer", "Receipt", "Out-of-cash mode"], firstMethod: "ATM.withdraw(amount)", race: "Two withdrawals consuming same denomination inventory in concurrent sessions is not typical per machine but matters in service simulation.", workflowCode: `final class CashDispenser {
    private final DenominationStrategy strategy;

    CashBundle dispense(Money amount) {
        CashBundle bundle = strategy.selectNotes(amount);
        if (!bundle.totalEquals(amount)) throw new IllegalStateException("Cannot dispense");
        return bundle;
    }
}`
    }
  ];

  const playbook = [
    topic("w8d21-playbook", 8, 21, "Interview Playbook and Mock Practice", "Convert learning into interview performance.", [
      lesson({
        id: "sde1-bar",
        name: "SDE1 Bar",
        problem: "SDE1 candidates often overthink patterns and under-deliver the core classes.",
        mentalModel: "For SDE1, first prove you can model the domain and code the happy path cleanly.",
        core: "Focus on OOP, entities, clear methods, simple patterns, and readable Java.",
        deepDive: "You do not need to solve every distributed edge case. You do need to protect state, name responsibilities, and explain at least one extension.",
        concepts: [card("Must show", "Entities, relationships, workflow, Java code."), card("Good signal", "Clean OOP and clear communication."), card("Risk", "Jumping to big architecture.")],
        examples: [card("Parking Lot", "Code park and exit."), card("Snake and Ladder", "Code playTurn."), card("Library", "Code issue and return.")],
        flow: ["Clarify", "Model", "Code core flow", "Name edge cases", "Explain extension"],
        tradeoffs: [card("Depth", "One flow deeply beats five flows shallowly."), card("Patterns", "Use only obvious ones.")],
        failures: ["No code.", "Only diagram.", "Pattern overload."],
        useWhen: ["SDE1 preparation."],
        avoidWhen: ["Do not spend 30 minutes on rare follow-ups."],
        codeTitle: "SDE1 answer rhythm",
        code: `// 1. Requirements
// 2. Entities
// 3. Main workflow
// 4. Java implementation
// 5. Edge cases and extension`,
        questions: [q("EASY", "What should SDE1 prioritize?", "Clear OOP and correct core workflow."), q("MEDIUM", "How many patterns?", "Only patterns that solve visible variation."), q("HARD", "How do you recover if stuck?", "Walk one user flow end to end and derive classes from it.")],
        revision: "SDE1 = clean OOP plus core flow."
      }),
      lesson({
        id: "sde2-bar",
        name: "SDE2 Bar",
        problem: "SDE2 interviews expect the same core design plus trade-offs, concurrency, extensibility, and tests.",
        mentalModel: "SDE2 is about evolution. Can your design survive new rules, multiple users, retries, and failures?",
        core: "Explain extension points, lock boundaries, idempotency, failure paths, and test strategy.",
        deepDive: "For every case study, identify the shared resource. Seat, spot, driver, room inventory, cache entry, token bucket, task lease. Then explain atomicity.",
        concepts: [card("Extensibility", "Policy/strategy for changing rules."), card("Concurrency", "Atomic check-plus-update."), card("Failure", "Compensate or mark failed."), card("Testing", "Invariant-based tests.")],
        examples: [card("BookMyShow", "Prevent double booking."), card("Ride Sharing", "Prevent double assignment."), card("Task Scheduler", "Prevent double execution.")],
        flow: ["Base design", "Follow-up", "Trade-off", "Concurrency", "Tests"],
        tradeoffs: [card("Simple design", "Fast to explain."), card("Production design", "Transactions, locks, idempotency."), card("Best answer", "Show both and choose based on scope.")],
        failures: ["No race-condition discussion.", "No failure branch.", "No tests."],
        useWhen: ["SDE2 and above."],
        avoidWhen: ["Do not overbuild before the base model is clear."],
        codeTitle: "SDE2 follow-up checklist",
        code: `// For every shared resource:
// 1. What is the invariant?
// 2. What operation is check-plus-update?
// 3. What lock or transaction protects it?
// 4. What happens on retry?`,
        questions: [q("EASY", "What makes SDE2 different?", "Trade-offs, concurrency, failure paths, tests, and extensibility."), q("MEDIUM", "What is the most common race?", "Two users assigning or reserving the same shared resource."), q("HARD", "How do you discuss production without overengineering?", "Say what the interview version does, then mention the production upgrade and its cost.")],
        revision: "SDE2 = base design plus evolution under pressure."
      })
    ])
  ];

  window.LLD_SYLLABUS = [
    ...foundation,
    ...solidAndPatterns,
    ...toolkit,
    ...caseSpecs.map(caseTopic),
    ...playbook
  ];

  window.LLD_REFERENCE = [
    {
      title: "LLD Problem Approach",
      rows: [
        ["1. Clarify", "Actors, core use cases, assumptions, out of scope."],
        ["2. Model", "Entities, value objects, services, policies, gateways."],
        ["3. Diagram", "Class relationships, sequence flow, state lifecycle."],
        ["4. Code", "Central workflow and key domain methods."],
        ["5. Defend", "Edge cases, concurrency, tests, extension points."]
      ]
    },
    {
      title: "Common Pattern Map",
      rows: [
        ["Strategy", "Payment mode, pricing rule, split type, dispatch, eviction."],
        ["Factory", "Create concrete class from type or config."],
        ["State", "Vending machine, order, booking, payment lifecycle."],
        ["Observer", "Notifications after domain events."],
        ["Adapter", "External providers behind internal interfaces."],
        ["Repository", "Hide persistence behind domain-friendly methods."]
      ]
    },
    {
      title: "Concurrency Hotspots",
      rows: [
        ["BookMyShow", "ShowSeat lock and confirmation."],
        ["Parking Lot", "Spot assignment across gates."],
        ["Ride Sharing", "Driver assignment."],
        ["Hotel Booking", "Room inventory by date range."],
        ["Cache", "Map plus eviction metadata."],
        ["Rate Limiter", "Counter or token update."]
      ]
    }
  ];
})();
