/**
 * Oracle Java SE 17 Developer (1Z0-829) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:java17-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedJava17(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/java17.ts`) and the protected
 * admin API (`/api/admin/seed-java17`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Oracle 1Z0-829 exam
 * objectives and Java SE 17 language/API behavior (JLS 17, Javadoc):
 *   - Handling Date, Time, Text, Numeric and Boolean Values  —  8% (5)
 *   - Controlling Program Flow                                —  8% (5)
 *   - Java Object-Oriented Approach                           — 18% (12)
 *   - Exception Handling                                      —  8% (5)
 *   - Working with Arrays and Collections                     — 10% (7)
 *   - Working with Streams and Lambda Expressions             — 14% (9)
 *   - Java Platform Module System                             —  8% (5)
 *   - Concurrency                                             — 10% (6)
 *   - Database Applications with JDBC                          —  8% (5)
 *   - Localization                                            —  8% (6)
 * Per-variant totals sum to exactly 65 (× 3 = 195).
 *
 * These are original questions; they are not copies of any real exam
 * and must never be presented as actual exam items.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';

type Opt = { id: string; text: string };
type Q = {
  domain: string;
  difficulty: number;
  type: QType;
  stem: string;
  options: Opt[];
  correct: string[];
  explanation: string;
  references: { label: string; url: string }[];
  isTeaser?: boolean;
};

const DTV = 'Handling Date, Time, Text, Numeric and Boolean Values';
const FLOW = 'Controlling Program Flow';
const OO = 'Java Object-Oriented Approach';
const EXC = 'Exception Handling';
const COLL = 'Working with Arrays and Collections';
const STREAM = 'Working with Streams and Lambda Expressions';
const JPMS = 'Java Platform Module System';
const CONC = 'Concurrency';
const JDBC = 'Database Applications with JDBC';
const L10N = 'Localization';

const REF_JLS_NUM = { label: 'JLS 17 — Numeric Promotions and Conversions', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-5.html' };
const REF_JLS_EXPR = { label: 'JLS 17 — Expressions', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html' };
const REF_JLS_STMT = { label: 'JLS 17 — Blocks and Statements', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-14.html' };
const REF_JLS_CLASS = { label: 'JLS 17 — Classes', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html' };
const REF_JLS_IFACE = { label: 'JLS 17 — Interfaces', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-9.html' };
const REF_OBJECTS = { label: 'Javadoc 17 — java.lang.Object', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html' };
const REF_STRING = { label: 'Javadoc 17 — java.lang.String', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html' };
const REF_STRINGBUILDER = { label: 'Javadoc 17 — java.lang.StringBuilder', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StringBuilder.html' };
const REF_TEXTBLOCK = { label: 'JLS 17 — Text Blocks', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-3.html#jls-3.10.6' };
const REF_LOCALDATE = { label: 'Javadoc 17 — java.time.LocalDate', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDate.html' };
const REF_PERIOD = { label: 'Javadoc 17 — java.time.Period', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/Period.html' };
const REF_DURATION = { label: 'Javadoc 17 — java.time.Duration', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/Duration.html' };
const REF_DATETIME = { label: 'Java Tutorials — The Date-Time API', url: 'https://docs.oracle.com/javase/tutorial/datetime/index.html' };
const REF_BIGDECIMAL = { label: 'Javadoc 17 — java.math.BigDecimal', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/math/BigDecimal.html' };
const REF_INTEGER = { label: 'Javadoc 17 — java.lang.Integer', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html' };
const REF_GENERICS = { label: 'Java Tutorials — Generics', url: 'https://docs.oracle.com/javase/tutorial/java/generics/index.html' };
const REF_RECORDS = { label: 'JLS 17 — Record Classes', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.10' };
const REF_SEALED = { label: 'JLS 17 — Sealed Classes and Interfaces', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.1.1.2' };
const REF_ENUM = { label: 'JLS 17 — Enum Classes', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.9' };
const REF_INSTANCEOF = { label: 'JLS 17 — Pattern Matching for instanceof', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html#jls-15.20.2' };
const REF_LAMBDA = { label: 'Java Tutorials — Lambda Expressions', url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html' };
const REF_EXCEPTIONS = { label: 'Java Tutorials — Exceptions', url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html' };
const REF_TWR = { label: 'JLS 17 — try-with-resources', url: 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-14.html#jls-14.20.3' };
const REF_THROWABLE = { label: 'Javadoc 17 — java.lang.Throwable', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Throwable.html' };
const REF_ARRAYS = { label: 'Javadoc 17 — java.util.Arrays', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html' };
const REF_LIST = { label: 'Javadoc 17 — java.util.List', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html' };
const REF_MAP = { label: 'Javadoc 17 — java.util.Map', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html' };
const REF_COLLECTIONS = { label: 'Javadoc 17 — java.util.Collections', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Collections.html' };
const REF_COMPARATOR = { label: 'Javadoc 17 — java.util.Comparator', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Comparator.html' };
const REF_STREAM = { label: 'Javadoc 17 — java.util.stream.Stream', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html' };
const REF_COLLECTORS = { label: 'Javadoc 17 — java.util.stream.Collectors', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html' };
const REF_OPTIONAL = { label: 'Javadoc 17 — java.util.Optional', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html' };
const REF_FUNCTION = { label: 'Javadoc 17 — java.util.function', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/function/package-summary.html' };
const REF_JPMS = { label: 'JEP 261 — Module System', url: 'https://openjdk.org/jeps/261' };
const REF_MODULE = { label: 'Oracle — Understanding the Module System', url: 'https://docs.oracle.com/en/java/javase/17/docs/specs/jar/jar.html' };
const REF_JLINK = { label: 'Oracle — jlink tool', url: 'https://docs.oracle.com/en/java/javase/17/docs/specs/man/jlink.html' };
const REF_JDEPS = { label: 'Oracle — jdeps tool', url: 'https://docs.oracle.com/en/java/javase/17/docs/specs/man/jdeps.html' };
const REF_CONC = { label: 'Java Tutorials — Concurrency', url: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html' };
const REF_EXECUTOR = { label: 'Javadoc 17 — java.util.concurrent.ExecutorService', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ExecutorService.html' };
const REF_CONCURRENT = { label: 'Javadoc 17 — java.util.concurrent', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/package-summary.html' };
const REF_ATOMIC = { label: 'Javadoc 17 — java.util.concurrent.atomic', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/package-summary.html' };
const REF_JDBC = { label: 'Java Tutorials — JDBC Basics', url: 'https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html' };
const REF_CONNECTION = { label: 'Javadoc 17 — java.sql.Connection', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Connection.html' };
const REF_RESULTSET = { label: 'Javadoc 17 — java.sql.ResultSet', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html' };
const REF_PREPSTMT = { label: 'Javadoc 17 — java.sql.PreparedStatement', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html' };
const REF_LOCALE = { label: 'Javadoc 17 — java.util.Locale', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html' };
const REF_RESOURCEBUNDLE = { label: 'Javadoc 17 — java.util.ResourceBundle', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ResourceBundle.html' };
const REF_NUMBERFORMAT = { label: 'Javadoc 17 — java.text.NumberFormat', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/NumberFormat.html' };
const REF_DATETIMEFMT = { label: 'Javadoc 17 — java.time.format.DateTimeFormatter', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/format/DateTimeFormatter.html' };
const REF_I18N = { label: 'Java Tutorials — Internationalization', url: 'https://docs.oracle.com/javase/tutorial/i18n/index.html' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Handling Date, Time, Text, Numeric and Boolean Values (5) ──
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    var d = java.time.LocalDate.of(2021, 1, 31);\n    System.out.println(d.plusMonths(1));',
    options: opts4(
      '2021-02-31',
      '2021-02-28',
      'A DateTimeException is thrown',
      '2021-03-03'
    ),
    correct: ['b'],
    explanation: 'LocalDate.plusMonths adjusts the day-of-month to the last valid day of the resulting month when the original day would be invalid. January 31 plus one month becomes 2021-02-28 (2021 is not a leap year), not an exception.',
    references: [REF_LOCALDATE, REF_DATETIME]
  },
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which expression creates a Period of 1 year, 2 months, and 3 days?',
    options: opts4(
      'Period.of(1, 2, 3)',
      'Period.ofYears(1).ofMonths(2).ofDays(3)',
      'Duration.of(1, 2, 3)',
      'Period.between(1, 2, 3)'
    ),
    correct: ['a'],
    explanation: 'Period.of(int years, int months, int days) returns a Period with all three fields set. The chained ofXxx calls are static and each returns an independent Period, so they do not accumulate. Duration measures time-based amounts, and Period.between takes two dates.',
    references: [REF_PERIOD]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What does this print?\n\n    System.out.println(1 / 2 * 2.0);',
    options: opts4(
      '1.0',
      '0.0',
      '2.0',
      'A compilation error occurs'
    ),
    correct: ['b'],
    explanation: 'Operators of equal precedence evaluate left-to-right. 1 / 2 is integer division yielding 0, then 0 * 2.0 promotes to double producing 0.0. The double promotion happens only at the multiplication, after the integer division has already discarded the fraction.',
    references: [REF_JLS_NUM, REF_JLS_EXPR]
  },
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE,
    stem: 'Given a text block:\n\n    String s = """\n        Hi\n        Java""";\n    System.out.println(s.lines().count());\n\nWhat is printed?',
    options: opts4(
      '1',
      '2',
      '3',
      'A compilation error occurs because text blocks need a delimiter'
    ),
    correct: ['b'],
    explanation: 'The text block contains two content lines ("Hi" and "Java"); incidental leading whitespace is stripped and there is no trailing newline because the closing delimiter follows "Java" directly. String.lines() therefore yields a stream of 2 elements.',
    references: [REF_TEXTBLOCK, REF_STRING]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the result of new java.math.BigDecimal("1.0").equals(new java.math.BigDecimal("1.00"))?',
    options: opts4(
      'true',
      'false',
      'It throws ArithmeticException',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'BigDecimal.equals considers both value and scale, so 1.0 (scale 1) is not equal to 1.00 (scale 2). compareTo would return 0 for these because it ignores scale. This scale sensitivity is a common BigDecimal pitfall.',
    references: [REF_BIGDECIMAL]
  },

  // ── Controlling Program Flow (5) ──
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    int x = 3;\n    var r = switch (x) {\n        case 1, 2 -> "low";\n        case 3, 4 -> "mid";\n        default -> "high";\n    };\n    System.out.println(r);',
    options: opts4(
      'low',
      'mid',
      'high',
      'It does not compile because switch cannot return a value'
    ),
    correct: ['b'],
    explanation: 'A switch expression with arrow labels evaluates the matching arm and yields its value with no fall-through. x is 3, which matches "case 3, 4 ->", so r becomes "mid". Switch expressions were standardized in Java 14.',
    references: [REF_JLS_STMT, REF_JLS_EXPR]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How many times is "X" printed?\n\n    for (int i = 0; i < 5; i++) {\n        if (i == 2) continue;\n        if (i == 4) break;\n        System.out.print("X");\n    }',
    options: opts4(
      '5',
      '4',
      '3',
      '2'
    ),
    correct: ['c'],
    explanation: 'i=0 prints X, i=1 prints X, i=2 hits continue (skip), i=3 prints X, i=4 hits break (loop ends before print). That is three X characters total.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    int n = 0;\n    do {\n        n++;\n    } while (n < 0);\n    System.out.println(n);',
    options: opts4(
      '0',
      '1',
      'Nothing — the loop never runs',
      'It loops forever'
    ),
    correct: ['b'],
    explanation: 'A do-while loop always executes its body at least once before testing the condition. n becomes 1, then n < 0 is false, so the loop exits with n equal to 1.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about a traditional switch on an int with no default is TRUE when no case matches?',
    options: opts4(
      'A runtime exception is thrown',
      'Execution skips the entire switch and continues after it',
      'The first case runs as a fallback',
      'The code does not compile without a default'
    ),
    correct: ['b'],
    explanation: 'In a colon-style switch statement, if no case label matches and there is no default label, the switch body is simply skipped and execution proceeds with the statement after the switch. No exception is thrown and default is not mandatory.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'In a labeled loop, "continue outer;" resumes the next iteration of the loop labeled "outer" rather than the innermost loop. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A labeled continue transfers control to the loop-continuation point of the loop bearing that label, so "continue outer;" proceeds with the next iteration of the loop labeled outer, skipping the rest of any inner loop body.',
    references: [REF_JLS_STMT]
  },

  // ── Java Object-Oriented Approach (12) ──
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Given:\n\n    record Point(int x, int y) {}\n\nWhich statement is TRUE?',
    options: opts4(
      'A canonical constructor, equals, hashCode, and toString are implicitly provided',
      'Point is mutable; x and y have setters',
      'Point can extend another class',
      'You must manually declare the x() and y() accessors'
    ),
    correct: ['a'],
    explanation: 'A record implicitly provides a canonical constructor, private final fields, public accessors named after components, and value-based equals, hashCode, and toString. Records are implicitly final, cannot extend a class, and their components are immutable.',
    references: [REF_RECORDS, REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    class A { String who() { return "A"; } }\n    class B extends A { String who() { return "B"; } }\n    A a = new B();\n    System.out.println(a.who());',
    options: opts4(
      'A',
      'B',
      'AB',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'Instance methods are dispatched dynamically on the runtime type of the object. Although the reference is declared as A, the object is a B, so the overridden who() in B is invoked and "B" is printed.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which declaration correctly uses pattern matching for instanceof?',
    options: opts4(
      'if (o instanceof String s) { System.out.println(s.length()); }',
      'if (o instanceof String) { System.out.println(o.length()); }',
      'if (o instanceof (String s)) { }',
      'if (instanceof String s = o) { }'
    ),
    correct: ['a'],
    explanation: 'Pattern matching for instanceof binds a pattern variable when the test succeeds: "o instanceof String s" introduces s of type String in the scope where the test is known true. Option B fails because o is still typed Object; the other syntaxes are invalid.',
    references: [REF_INSTANCEOF]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given:\n\n    sealed interface Shape permits Circle, Square {}\n\nWhich is required for this to compile?',
    options: opts4(
      'Circle and Square must each be final, sealed, or non-sealed',
      'Circle and Square must be in a different package',
      'Shape must be abstract',
      'permits must list at least three subtypes'
    ),
    correct: ['a'],
    explanation: 'Every direct subtype of a sealed type must itself be declared final, sealed, or non-sealed, and it must be accessible to the sealed type (same module, and same package if unnamed module). The number of permitted subtypes is unrestricted.',
    references: [REF_SEALED]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    interface Greeter { default String hi() { return "hi"; } }\n    class En implements Greeter { public String hi() { return Greeter.super.hi() + "!"; } }\n    System.out.println(new En().hi());',
    options: opts4(
      'hi',
      'hi!',
      '!',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'A class can invoke an inherited interface default method using the InterfaceName.super.method() syntax. En.hi() calls Greeter.super.hi() (returns "hi") and appends "!", producing "hi!".',
    references: [REF_JLS_IFACE]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given an enum:\n\n    enum Day { MON, TUE; }\n\nWhich expression returns the number of constants?',
    options: opts4(
      'Day.size()',
      'Day.values().length',
      'Day.count()',
      'Day.length'
    ),
    correct: ['b'],
    explanation: 'The compiler adds an implicit static values() method to every enum returning an array of its constants in declaration order; its length gives the count. There is no size(), count(), or length member generated for enums.',
    references: [REF_ENUM]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a class with no explicitly declared constructor is TRUE?',
    options: opts4(
      'The compiler inserts a default no-argument constructor with the same access modifier as the class',
      'The class cannot be instantiated',
      'The compiler inserts a constructor taking all fields',
      'A no-argument constructor must always be written manually'
    ),
    correct: ['a'],
    explanation: 'If a class declares no constructors, the compiler provides a default constructor with no parameters and an empty body (apart from an implicit super() call), and it has the same access modifier as the class.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    class C { static int n; { n++; } C() { n++; } }\n    new C(); new C();\n    System.out.println(C.n);',
    options: opts4(
      '2',
      '3',
      '4',
      '0'
    ),
    correct: ['c'],
    explanation: 'An instance initializer block runs before the constructor body each time an instance is created. Each "new C()" runs the block (n++) then the constructor (n++), adding 2 per instance. Two instances give n == 4.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the correct way to declare a generic method that returns its parameter?',
    options: opts4(
      'static <T> T identity(T t) { return t; }',
      'static T <T> identity(T t) { return t; }',
      'static identity<T>(T t) { return t; }',
      '<T> static T identity(T t) { return t; }'
    ),
    correct: ['a'],
    explanation: 'A generic method declares its type parameter list immediately before the return type: "static <T> T identity(T t)". The type parameter section must precede the return type, not follow it or appear before static.',
    references: [REF_GENERICS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What happens when this compiles and runs?\n\n    Object o = "abc";\n    Integer i = (Integer) o;',
    options: opts4(
      'It compiles but throws ClassCastException at runtime',
      'It fails to compile',
      'i becomes null',
      'It prints abc'
    ),
    correct: ['a'],
    explanation: 'The cast (Integer) o is allowed at compile time because o is declared as Object, but at runtime the object is actually a String, so the JVM throws ClassCastException since String is not an Integer.',
    references: [REF_JLS_EXPR, REF_OBJECTS]
  },
  {
    domain: OO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'An abstract class may declare constructors and may contain both abstract and concrete (non-abstract) methods. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Abstract classes can declare constructors (invoked via super() by subclasses) and can mix abstract methods with fully implemented concrete methods and fields. They simply cannot be instantiated directly.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given overloaded methods m(int) and m(Integer), which is called by m((short)1)?',
    options: opts4(
      'm(int) via widening of short to int',
      'm(Integer) via autoboxing of short',
      'It is ambiguous and fails to compile',
      'm(short) is implicitly generated'
    ),
    correct: ['a'],
    explanation: 'Overload resolution prefers widening primitive conversion over boxing. A short widens to int without boxing, so m(int) is selected. Boxing to Integer would only be considered if no applicable method existed by widening.',
    references: [REF_JLS_EXPR, REF_JLS_NUM]
  },

  // ── Exception Handling (5) ──
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    try {\n        System.out.print("T");\n        throw new RuntimeException();\n    } catch (Exception e) {\n        System.out.print("C");\n    } finally {\n        System.out.print("F");\n    }',
    options: opts4(
      'TC',
      'TCF',
      'TF',
      'TFC'
    ),
    correct: ['b'],
    explanation: 'The try prints "T" then throws; the catch handles it and prints "C"; the finally block always runs and prints "F". The order is therefore TCF.',
    references: [REF_EXCEPTIONS]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which exception is unchecked (not required to be declared or caught)?',
    options: opts4(
      'java.io.IOException',
      'java.lang.IllegalArgumentException',
      'java.sql.SQLException',
      'java.lang.ClassNotFoundException'
    ),
    correct: ['b'],
    explanation: 'IllegalArgumentException extends RuntimeException and is therefore unchecked. IOException, SQLException, and ClassNotFoundException are checked exceptions (subclasses of Exception but not RuntimeException) requiring declaration or handling.',
    references: [REF_EXCEPTIONS, REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'In a try-with-resources statement with two resources opened as (A a = ...; B b = ...), in what order are they closed?',
    options: opts4(
      'a is closed, then b',
      'b is closed, then a',
      'Both are closed concurrently',
      'Only the last resource is closed'
    ),
    correct: ['b'],
    explanation: 'Resources in a try-with-resources are closed in the reverse order of their declaration. With (A a; B b), b is closed first, then a, regardless of whether an exception occurred.',
    references: [REF_TWR]
  },
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the result of a multi-catch clause "catch (IOException | RuntimeException e)" attempting to assign to e inside the block?',
    options: opts4(
      'It compiles; e is effectively final and cannot be reassigned',
      'e can be freely reassigned to a new exception',
      'Multi-catch is not valid Java syntax',
      'IOException and RuntimeException cannot appear together because one is checked'
    ),
    correct: ['a'],
    explanation: 'In a multi-catch clause the exception parameter is implicitly final and cannot be assigned a new value. Unrelated checked and unchecked types may be combined as long as neither is a subclass of another in the list.',
    references: [REF_EXCEPTIONS]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does this method return?\n\n    static int f() {\n        try { return 1; }\n        finally { return 2; }\n    }',
    options: opts4(
      '1',
      '2',
      'It does not compile',
      'It throws an exception'
    ),
    correct: ['b'],
    explanation: 'A return in a finally block overrides any return (or exception) from the try block. The try attempts to return 1 but the finally executes "return 2", so the method returns 2. This pattern is discouraged.',
    references: [REF_JLS_STMT, REF_EXCEPTIONS]
  },

  // ── Working with Arrays and Collections (7) ──
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    int[] a = {3, 1, 2};\n    java.util.Arrays.sort(a);\n    System.out.println(java.util.Arrays.toString(a));',
    options: opts4(
      '[3, 1, 2]',
      '[1, 2, 3]',
      '[3, 2, 1]',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'Arrays.sort sorts a primitive int array into ascending natural order in place. After sorting, Arrays.toString prints [1, 2, 3].',
    references: [REF_ARRAYS]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What happens?\n\n    var list = java.util.List.of(1, 2, 3);\n    list.add(4);',
    options: opts4(
      'list becomes [1, 2, 3, 4]',
      'UnsupportedOperationException is thrown',
      'It does not compile',
      'IndexOutOfBoundsException is thrown'
    ),
    correct: ['b'],
    explanation: 'List.of returns an immutable list. Any mutating operation such as add throws UnsupportedOperationException at runtime. The call compiles because List declares add.',
    references: [REF_LIST]
  },
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which collection guarantees keys are kept in ascending sorted order?',
    options: opts4(
      'java.util.HashMap',
      'java.util.LinkedHashMap',
      'java.util.TreeMap',
      'java.util.Hashtable'
    ),
    correct: ['c'],
    explanation: 'TreeMap is a NavigableMap that keeps its keys sorted by natural ordering or a supplied Comparator. HashMap/Hashtable are unordered; LinkedHashMap preserves insertion order, not sorted order.',
    references: [REF_MAP, REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var m = new java.util.HashMap<String,Integer>();\n    m.put("a", 1);\n    m.merge("a", 10, Integer::sum);\n    System.out.println(m.get("a"));',
    options: opts4(
      '1',
      '10',
      '11',
      'null'
    ),
    correct: ['c'],
    explanation: 'Map.merge applies the remapping function when the key already has a non-null value: sum(1, 10) is 11, which becomes the new value for "a".',
    references: [REF_MAP]
  },
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which call sorts a List<String> names into reverse alphabetical order?',
    options: opts4(
      'names.sort(Comparator.naturalOrder())',
      'names.sort(Comparator.reverseOrder())',
      'Collections.shuffle(names)',
      'names.sort(null)'
    ),
    correct: ['b'],
    explanation: 'Comparator.reverseOrder() returns a comparator imposing the reverse of natural ordering, so List.sort with it produces descending (reverse alphabetical) order. naturalOrder and null both sort ascending.',
    references: [REF_COMPARATOR, REF_LIST]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the result of new java.util.ArrayDeque<Integer>() used as a stack with push(1), push(2), then pop()?',
    options: opts4(
      '1',
      '2',
      'It throws an exception because ArrayDeque is not a stack',
      'null'
    ),
    correct: ['b'],
    explanation: 'ArrayDeque implements Deque and supports stack operations where push adds to the head and pop removes from the head (LIFO). After push(1) then push(2), pop() returns 2.',
    references: [REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Calling Arrays.asList(1, 2, 3).set(0, 9) succeeds, but add(4) on that list throws UnsupportedOperationException. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Arrays.asList returns a fixed-size list backed by the array: element replacement via set is allowed, but structural modifications such as add or remove throw UnsupportedOperationException.',
    references: [REF_ARRAYS, REF_LIST]
  },

  // ── Working with Streams and Lambda Expressions (9) ──
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    var r = java.util.stream.Stream.of(1, 2, 3, 4)\n        .filter(n -> n % 2 == 0)\n        .map(n -> n * n)\n        .reduce(0, Integer::sum);\n    System.out.println(r);',
    options: opts4(
      '20',
      '30',
      '10',
      '4'
    ),
    correct: ['a'],
    explanation: 'filter keeps even numbers 2 and 4; map squares them to 4 and 16; reduce with identity 0 and sum yields 4 + 16 = 20.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which terminal operation returns an Optional?',
    options: opts4(
      'Stream.forEach',
      'Stream.findFirst',
      'Stream.count',
      'Stream.toArray'
    ),
    correct: ['b'],
    explanation: 'findFirst returns an Optional describing the first element (empty if the stream is empty). forEach returns void, count returns long, and toArray returns an array.',
    references: [REF_STREAM, REF_OPTIONAL]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var m = java.util.stream.Stream.of("apple", "banana", "avocado")\n        .collect(java.util.stream.Collectors.groupingBy(s -> s.charAt(0)));\n    System.out.println(m.get(\'a\').size());',
    options: opts4(
      '1',
      '2',
      '3',
      'null'
    ),
    correct: ['b'],
    explanation: 'Collectors.groupingBy partitions elements by the classifier (first character). Words starting with \'a\' are "apple" and "avocado", so the list under key \'a\' has size 2.',
    references: [REF_COLLECTORS]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which functional interface has the abstract method "R apply(T t)"?',
    options: opts4(
      'java.util.function.Supplier<R>',
      'java.util.function.Function<T,R>',
      'java.util.function.Consumer<T>',
      'java.util.function.Predicate<T>'
    ),
    correct: ['b'],
    explanation: 'Function<T,R> declares R apply(T t). Supplier has T get(), Consumer has void accept(T), and Predicate has boolean test(T).',
    references: [REF_FUNCTION]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does this print?\n\n    System.out.println(java.util.stream.IntStream.rangeClosed(1, 5).sum());',
    options: opts4(
      '10',
      '15',
      '14',
      '5'
    ),
    correct: ['b'],
    explanation: 'IntStream.rangeClosed(1, 5) produces 1, 2, 3, 4, 5 (the end is inclusive). Their sum is 15. range(1, 5) would exclude 5 and sum to 10.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the effect of calling .map(...) on a stream but never invoking a terminal operation?',
    options: opts4(
      'The mapping function is applied immediately to all elements',
      'Nothing happens — intermediate operations are lazy and require a terminal operation',
      'A compilation error occurs',
      'An IllegalStateException is thrown'
    ),
    correct: ['b'],
    explanation: 'Stream intermediate operations such as map are lazy: they build a pipeline but do no work until a terminal operation (e.g., collect, forEach, count) triggers traversal. Without a terminal op, the function is never applied.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which lambda is a valid Predicate<String> testing for an empty string?',
    options: opts4(
      's -> s.isEmpty()',
      's -> { s.isEmpty(); }',
      '(String s) -> return s.isEmpty();',
      's => s.isEmpty()'
    ),
    correct: ['a'],
    explanation: 'A Predicate<String> needs boolean test(String). The expression lambda "s -> s.isEmpty()" returns the boolean directly. A block body would need an explicit return statement with braces; "=>" is not Java lambda syntax.',
    references: [REF_LAMBDA, REF_FUNCTION]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var s = java.util.stream.Stream.of("a", "b", "c");\n    System.out.println(s.collect(java.util.stream.Collectors.joining("-", "[", "]")));',
    options: opts4(
      'a-b-c',
      '[a-b-c]',
      '[a, b, c]',
      'abc'
    ),
    correct: ['b'],
    explanation: 'Collectors.joining(delimiter, prefix, suffix) concatenates elements with the delimiter between them and wraps the result with prefix and suffix, producing "[a-b-c]".',
    references: [REF_COLLECTORS]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A Stream can be traversed (consumed by a terminal operation) only once; reusing it throws IllegalStateException. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Streams are single-use. After a terminal operation has been invoked, attempting to reuse the same stream throws IllegalStateException ("stream has already been operated upon or closed").',
    references: [REF_STREAM]
  },

  // ── Java Platform Module System (5) ──
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In which file is a module declaration written?',
    options: opts4(
      'package-info.java',
      'module-info.java',
      'MANIFEST.MF',
      'module.properties'
    ),
    correct: ['b'],
    explanation: 'A module declaration is written in a file named module-info.java at the root of the module\'s source, compiled to module-info.class. MANIFEST.MF is for jar metadata, not module declarations.',
    references: [REF_JPMS, REF_MODULE]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which directive makes a package available only to specific named modules at compile and run time?',
    options: opts4(
      'exports pkg;',
      'exports pkg to modA, modB;',
      'opens pkg;',
      'requires transitive pkg;'
    ),
    correct: ['b'],
    explanation: 'A qualified export "exports pkg to modA, modB;" makes the package accessible only to the listed modules. An unqualified "exports pkg;" makes it available to all readers. "opens" concerns reflective access.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'What does "requires transitive M;" provide?',
    options: opts4(
      'It hides M from the current module',
      'Modules that read the current module also implicitly read M (implied readability)',
      'It opens M for reflection',
      'It loads M lazily at runtime only'
    ),
    correct: ['b'],
    explanation: '"requires transitive" establishes implied readability: any module that requires the current module automatically reads M as well, so M\'s API can appear in the current module\'s public signatures.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool creates a custom runtime image containing only the required modules?',
    options: opts4(
      'jdeps',
      'jlink',
      'javap',
      'jar'
    ),
    correct: ['b'],
    explanation: 'jlink assembles and optimizes a set of modules and their dependencies into a custom, smaller runtime image. jdeps analyzes dependencies; javap disassembles; jar packages archives.',
    references: [REF_JLINK]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A module that uses a service interface must declare "uses ServiceInterface;" in its module-info to obtain implementations via ServiceLoader. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A consumer module must declare "uses ServiceInterface;" so the module system permits ServiceLoader to locate provider implementations. Providers correspondingly declare "provides ServiceInterface with Impl;".',
    references: [REF_JPMS]
  },

  // ── Concurrency (6) ──
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which method starts a new thread of execution by invoking the thread\'s run() on a separate call stack?',
    options: opts4(
      'Thread.run()',
      'Thread.start()',
      'Thread.execute()',
      'Thread.launch()'
    ),
    correct: ['b'],
    explanation: 'Thread.start() schedules the thread and the JVM invokes run() on a new call stack. Calling run() directly executes it on the current thread with no new thread; execute() and launch() are not Thread methods.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ExecutorService factory returns a pool that reuses a fixed number of threads?',
    options: opts4(
      'Executors.newCachedThreadPool()',
      'Executors.newFixedThreadPool(int n)',
      'Executors.newSingleThreadExecutor()',
      'Executors.newWorkStealingPool()'
    ),
    correct: ['b'],
    explanation: 'Executors.newFixedThreadPool(n) creates a pool that reuses exactly n threads, queuing extra tasks. The cached pool grows/shrinks on demand, single-thread uses one worker, and work-stealing uses a ForkJoinPool.',
    references: [REF_EXECUTOR]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does AtomicInteger\'s incrementAndGet() guarantee that "i++" on a plain int field does not?',
    options: opts4(
      'It is faster than i++ in all cases',
      'It performs the read-modify-write atomically without explicit synchronization',
      'It blocks all other threads on the JVM',
      'It makes the variable immutable'
    ),
    correct: ['b'],
    explanation: 'AtomicInteger.incrementAndGet performs an atomic compare-and-set based read-modify-write, avoiding the lost-update race that "i++" (a non-atomic compound operation) suffers under concurrent access.',
    references: [REF_ATOMIC]
  },
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which interface should a task implement to return a result and allow checked exceptions when submitted to an ExecutorService?',
    options: opts4(
      'Runnable',
      'Callable<V>',
      'Supplier<V>',
      'Thread'
    ),
    correct: ['b'],
    explanation: 'Callable<V> declares V call() throws Exception, returning a value and allowing checked exceptions; submitting it yields a Future<V>. Runnable returns nothing and cannot throw checked exceptions.',
    references: [REF_EXECUTOR, REF_CONCURRENT]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the purpose of declaring a field "volatile" in a multithreaded program?',
    options: opts4(
      'It makes compound operations like count++ atomic',
      'It guarantees visibility: writes by one thread are visible to subsequent reads by other threads',
      'It acquires an intrinsic lock on every access',
      'It prevents the field from being garbage collected'
    ),
    correct: ['b'],
    explanation: 'volatile establishes a happens-before relationship ensuring a write is visible to threads that subsequently read the field, and prevents caching/reordering of that variable. It does not make compound actions atomic.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'java.util.concurrent.ConcurrentHashMap allows concurrent reads and high-concurrency updates without locking the entire map. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'ConcurrentHashMap supports full-concurrency retrievals and high expected concurrency for updates by locking only portions (bins) of the map rather than the whole structure, unlike a synchronized Map wrapper.',
    references: [REF_CONCURRENT]
  },

  // ── Database Applications with JDBC (5) ──
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which JDBC interface should be used to safely pass user input into a parameterized SQL query?',
    options: opts4(
      'java.sql.Statement',
      'java.sql.PreparedStatement',
      'java.sql.DriverManager',
      'java.sql.ResultSetMetaData'
    ),
    correct: ['b'],
    explanation: 'PreparedStatement precompiles SQL with "?" placeholders and binds parameters via setXxx, preventing SQL injection and improving performance. Statement concatenates raw SQL and is injection-prone.',
    references: [REF_PREPSTMT, REF_JDBC]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does ResultSet.next() return when the cursor is moved past the last row?',
    options: opts4(
      'true',
      'false',
      'It throws SQLException',
      'It returns null'
    ),
    correct: ['b'],
    explanation: 'ResultSet.next() moves the cursor forward one row and returns true if the new current row is valid, or false when there are no more rows (cursor moved beyond the last row).',
    references: [REF_RESULTSET]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'After conn.setAutoCommit(false), which call permanently persists the changes made by executed statements?',
    options: opts4(
      'conn.flush()',
      'conn.commit()',
      'conn.close()',
      'conn.save()'
    ),
    correct: ['b'],
    explanation: 'With auto-commit disabled, changes are part of a transaction that is made permanent only by Connection.commit() (or discarded with rollback()). There is no flush() or save() on Connection.',
    references: [REF_CONNECTION]
  },
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which method executes an INSERT/UPDATE/DELETE and returns the affected row count?',
    options: opts4(
      'Statement.executeQuery(String)',
      'Statement.executeUpdate(String)',
      'Statement.getResultSet()',
      'Statement.execute(String) only'
    ),
    correct: ['b'],
    explanation: 'executeUpdate returns an int row-count for INSERT, UPDATE, or DELETE (or 0 for statements returning nothing). executeQuery is for SELECT and returns a ResultSet.',
    references: [REF_JDBC, REF_CONNECTION]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Closing a JDBC Connection used in a try-with-resources also implicitly releases its open Statement and ResultSet objects. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Closing a Connection releases JDBC resources; per the spec a Connection\'s Statement objects are closed, which in turn closes their ResultSet objects. try-with-resources still makes explicit closing the safer practice.',
    references: [REF_CONNECTION, REF_JDBC]
  },

  // ── Localization (6) ──
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which class is used to load locale-specific key/value text such as labels?',
    options: opts4(
      'java.util.Locale',
      'java.util.ResourceBundle',
      'java.text.MessageFormat',
      'java.util.Properties'
    ),
    correct: ['b'],
    explanation: 'ResourceBundle loads locale-specific resources (e.g., Messages_fr.properties) keyed by name, selecting the bundle for a given Locale with a fallback chain. Locale only identifies a region/language.',
    references: [REF_RESOURCEBUNDLE, REF_I18N]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Which factory returns a NumberFormat that formats values as currency for a given Locale?',
    options: opts4(
      'NumberFormat.getInstance(locale)',
      'NumberFormat.getCurrencyInstance(locale)',
      'NumberFormat.getPercentInstance(locale)',
      'NumberFormat.getIntegerInstance(locale)'
    ),
    correct: ['b'],
    explanation: 'NumberFormat.getCurrencyInstance(Locale) returns a formatter that renders numbers using the locale\'s currency symbol and conventions. The other factories produce general, percent, or integer formats.',
    references: [REF_NUMBERFORMAT, REF_I18N]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Given Locale built as new Locale("fr", "CA"), what does locale.getLanguage() return?',
    options: opts4(
      'CA',
      'fr',
      'fr_CA',
      'French'
    ),
    correct: ['b'],
    explanation: 'getLanguage() returns the lowercase ISO 639 language code ("fr"). getCountry() would return "CA"; toString() would yield "fr_CA". getDisplayLanguage() returns the human-readable name.',
    references: [REF_LOCALE]
  },
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE,
    stem: 'When a ResourceBundle for Locale("de","DE") is requested but only Messages.properties and Messages_de.properties exist, which is used?',
    options: opts4(
      'Messages_de_DE.properties (creation fails because it is missing)',
      'Messages_de.properties via the fallback search order',
      'Messages.properties only',
      'A MissingResourceException is always thrown'
    ),
    correct: ['b'],
    explanation: 'ResourceBundle searches from most specific to least specific: Messages_de_DE, then Messages_de, then the base Messages. The most specific existing match, Messages_de.properties, is selected.',
    references: [REF_RESOURCEBUNDLE]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Which class formats a LocalDate according to a locale-sensitive pattern in java.time?',
    options: opts4(
      'java.text.SimpleDateFormat',
      'java.time.format.DateTimeFormatter',
      'java.util.Formatter',
      'java.text.DateFormatSymbols'
    ),
    correct: ['b'],
    explanation: 'java.time types are formatted with DateTimeFormatter, which supports localized styles via ofLocalizedDate and withLocale. SimpleDateFormat works with the legacy java.util.Date, not java.time.LocalDate.',
    references: [REF_DATETIMEFMT, REF_LOCALDATE]
  },
  {
    domain: L10N, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Locale.getDefault() returns the JVM\'s default locale, which can be changed at runtime via Locale.setDefault(Locale). True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Locale.getDefault() returns the current default locale (initialized from the host environment), and Locale.setDefault(Locale) replaces it for the JVM instance, affecting locale-sensitive operations that do not take an explicit Locale.',
    references: [REF_LOCALE, REF_I18N]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Handling Date, Time, Text, Numeric and Boolean Values (5) ──
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    var a = java.time.LocalTime.of(10, 30);\n    System.out.println(a.plusMinutes(45));',
    options: opts4(
      '10:75',
      '11:15',
      '10:30',
      'A DateTimeException is thrown'
    ),
    correct: ['b'],
    explanation: 'LocalTime.plusMinutes adds minutes and rolls over hours correctly: 10:30 plus 45 minutes is 11:15. LocalTime never produces an invalid value such as 10:75.',
    references: [REF_DATETIME]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    System.out.println(0.1 + 0.2 == 0.3);',
    options: opts4(
      'true',
      'false',
      'It does not compile',
      'It throws ArithmeticException'
    ),
    correct: ['b'],
    explanation: 'IEEE 754 double cannot represent 0.1, 0.2, or 0.3 exactly, so 0.1 + 0.2 yields approximately 0.30000000000000004, which is not equal to the double nearest 0.3. Use BigDecimal or a tolerance for exact decimal comparisons.',
    references: [REF_JLS_NUM]
  },
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does "abc".indexOf("d") return?',
    options: opts4(
      '0',
      '-1',
      '3',
      'It throws StringIndexOutOfBoundsException'
    ),
    correct: ['b'],
    explanation: 'String.indexOf returns -1 when the argument substring is not found. It does not throw for a missing substring; it only returns a non-negative index when a match exists.',
    references: [REF_STRING]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var sb = new StringBuilder("abc");\n    sb.reverse().append("X");\n    System.out.println(sb);',
    options: opts4(
      'abcX',
      'cbaX',
      'Xcba',
      'Xabc'
    ),
    correct: ['b'],
    explanation: 'StringBuilder.reverse() mutates the buffer in place to "cba" and returns the same builder; append("X") then yields "cbaX". StringBuilder methods chain on the same mutable object.',
    references: [REF_STRINGBUILDER]
  },
  {
    domain: DTV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Strings created with double quotes are interned in the string pool, so "ab" == "ab" is true, while new String("ab") == "ab" is false. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'String literals are interned, so identical literals refer to the same pooled object and == is true. new String() always allocates a distinct object, so == against a literal is false even though equals would be true.',
    references: [REF_STRING]
  },

  // ── Controlling Program Flow (5) ──
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    int i = 5;\n    System.out.println(i > 0 ? "pos" : i == 0 ? "zero" : "neg");',
    options: opts4(
      'pos',
      'zero',
      'neg',
      'It does not compile'
    ),
    correct: ['a'],
    explanation: 'The conditional (ternary) operator is right-associative. i > 0 is true, so the result is "pos" without evaluating the nested ternary.',
    references: [REF_JLS_EXPR]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    int sum = 0;\n    for (int i = 1; i <= 3; i++)\n        for (int j = 1; j <= 3; j++) {\n            if (j == 2) break;\n            sum += j;\n        }\n    System.out.println(sum);',
    options: opts4(
      '3',
      '6',
      '9',
      '18'
    ),
    correct: ['a'],
    explanation: 'For each of the 3 outer iterations, the inner loop adds j=1 (sum += 1) then breaks when j == 2. That contributes 1 per outer iteration, so sum = 1 + 1 + 1 = 3.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which switch selector type is NOT permitted in a traditional switch statement in Java 17?',
    options: opts4(
      'int',
      'String',
      'an enum constant\'s enum type',
      'double'
    ),
    correct: ['d'],
    explanation: 'switch supports byte, short, char, int (and their wrappers), String, and enum types. Floating-point types such as double (and boolean, long) are not valid switch selector types.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'In an enhanced for loop "for (int v : arr)", what happens if arr is null?',
    options: opts4(
      'The loop body runs zero times',
      'A NullPointerException is thrown at runtime',
      'It does not compile',
      'It iterates once with v = 0'
    ),
    correct: ['b'],
    explanation: 'The enhanced for loop evaluates the iterable/array expression first; if it is null, a NullPointerException is thrown when attempting to obtain its length or iterator. An empty array (not null) would run zero times.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'In a switch expression using arrow labels, an arm may use a block with "yield value;" to produce the switch result. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A switch expression arm can be a single expression or a block; a block must use the yield statement to produce the value of the switch expression for that case.',
    references: [REF_JLS_STMT, REF_JLS_EXPR]
  },

  // ── Java Object-Oriented Approach (12) ──
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is TRUE about a compact canonical constructor in a record?\n\n    record R(int v) {\n        R { if (v < 0) throw new IllegalArgumentException(); }\n    }',
    options: opts4(
      'It must explicitly assign this.v = v;',
      'Fields are assigned automatically after the compact constructor body runs',
      'Compact constructors cannot validate parameters',
      'It must declare a parameter list'
    ),
    correct: ['b'],
    explanation: 'A compact canonical constructor omits the parameter list and the field assignments; after its body runs, the record components are automatically assigned from the (possibly normalized) parameters. It is ideal for validation/normalization.',
    references: [REF_RECORDS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    class A { A() { print(); } void print() { System.out.print("A"); } }\n    class B extends A { int x = 5; void print() { System.out.print(x); } }\n    new B();',
    options: opts4(
      '5',
      '0',
      'A',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'A\'s constructor runs before B\'s field initializers. The overridden print() in B executes during A\'s constructor while x still holds its default 0 (the "5" initializer has not run yet), so 0 is printed.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which modifier combination is illegal for a method?',
    options: opts4(
      'public static',
      'protected final',
      'abstract final',
      'private static'
    ),
    correct: ['c'],
    explanation: 'abstract and final are contradictory: abstract requires the method to be overridden, while final forbids overriding. The other combinations are legal.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given interfaces A and B both declaring a default method m(), what must a class implementing both do?',
    options: opts4(
      'Nothing — the compiler picks one automatically',
      'Override m() to resolve the conflict (optionally calling A.super.m() or B.super.m())',
      'Declare the class abstract regardless',
      'It is impossible to implement both interfaces'
    ),
    correct: ['b'],
    explanation: 'When two inherited default methods have the same signature, the implementing class must override m() to resolve the ambiguity, and may delegate explicitly via A.super.m() or B.super.m().',
    references: [REF_JLS_IFACE]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the "var" keyword do in: var list = new java.util.ArrayList<String>();',
    options: opts4(
      'Declares a dynamically typed variable',
      'Infers the static type ArrayList<String> at compile time',
      'Creates a raw-typed list',
      'Defers type resolution to runtime'
    ),
    correct: ['b'],
    explanation: 'var triggers local-variable type inference: the compiler infers the static type from the initializer (here ArrayList<String>). The variable is still strongly, statically typed — var is not dynamic typing.',
    references: [REF_JLS_STMT]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    Integer a = 127, b = 127;\n    Integer c = 128, d = 128;\n    System.out.println((a == b) + " " + (c == d));',
    options: opts4(
      'true true',
      'true false',
      'false false',
      'false true'
    ),
    correct: ['b'],
    explanation: 'Integer autoboxing caches values in the range -128..127, so a and b refer to the same cached object (== true). 128 is outside the cache, so c and d are distinct objects (== false). Use equals for value comparison.',
    references: [REF_INTEGER]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about static methods and inheritance is TRUE?',
    options: opts4(
      'Static methods are overridden polymorphically like instance methods',
      'A static method in a subclass with the same signature hides (not overrides) the superclass method',
      'Static methods cannot be inherited at all',
      'Static methods can be abstract'
    ),
    correct: ['b'],
    explanation: 'Static methods are not polymorphic; a same-signature static method in a subclass hides the superclass one. The method invoked is determined by the compile-time type, not the runtime object. Static methods cannot be abstract.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the result?\n\n    var r1 = new java.awt.Point(1, 2);\n\nWhich record-like equality holds for "record P(int x,int y){}" with P p=new P(1,2), q=new P(1,2)?',
    options: opts4(
      'p == q is true',
      'p.equals(q) is true and p.hashCode() == q.hashCode()',
      'p.equals(q) is false because records use identity equality',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'Records generate value-based equals and hashCode from their components. Two P instances with equal components are equal and share a hash code, though they remain distinct objects so == is false.',
    references: [REF_RECORDS]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid use of a bounded type parameter?',
    options: opts4(
      'class Box<T extends Number> {}',
      'class Box<T implements Number> {}',
      'class Box<T super Number> {}',
      'class Box<T : Number> {}'
    ),
    correct: ['a'],
    explanation: 'A bounded type parameter uses "extends" for both class and interface bounds: <T extends Number>. "implements", "super" (only valid in wildcards), and ":" are not valid type-parameter bound syntax.',
    references: [REF_GENERICS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    enum Sz { S, M, L; }\n    System.out.println(Sz.M.ordinal() + " " + Sz.M.name());',
    options: opts4(
      '1 M',
      '2 M',
      '1 1',
      '0 M'
    ),
    correct: ['a'],
    explanation: 'ordinal() returns the zero-based position in declaration order, so M (the second constant) has ordinal 1. name() returns the constant\'s identifier "M".',
    references: [REF_ENUM]
  },
  {
    domain: OO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'An interface may declare private methods (instance or static) in Java 17 to share code among its default methods. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Since Java 9, interfaces can declare private and private static methods. They are not part of the public API and exist to factor common logic out of default/static methods.',
    references: [REF_JLS_IFACE]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given "class B extends A", in B\'s constructor where no super(...) is written explicitly, what happens?',
    options: opts4(
      'No superclass constructor is called',
      'The compiler inserts an implicit super() call to A\'s no-arg constructor as the first statement',
      'A\'s fields remain uninitialized',
      'It only compiles if A is abstract'
    ),
    correct: ['b'],
    explanation: 'If a constructor does not explicitly invoke super(...) or this(...), the compiler inserts an implicit super() as the first statement. If A has no accessible no-arg constructor, a compile error results.',
    references: [REF_JLS_CLASS]
  },

  // ── Exception Handling (5) ──
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the most general checked exception type appropriate to catch I/O failures?',
    options: opts4(
      'java.lang.RuntimeException',
      'java.io.IOException',
      'java.lang.Error',
      'java.lang.NullPointerException'
    ),
    correct: ['b'],
    explanation: 'IOException is the checked superclass for I/O related failures (FileNotFoundException, etc.). RuntimeException/NullPointerException are unchecked and unrelated; Error indicates serious abnormal conditions, not I/O.',
    references: [REF_EXCEPTIONS, REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    try {\n        throw new IllegalStateException("x");\n    } catch (RuntimeException e) {\n        System.out.print(e.getMessage());\n    }',
    options: opts4(
      'null',
      'x',
      'IllegalStateException',
      'It does not compile because IllegalStateException is not a RuntimeException'
    ),
    correct: ['b'],
    explanation: 'IllegalStateException extends RuntimeException, so the catch matches. getMessage() returns the detail message passed to the constructor, "x".',
    references: [REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'For a resource used in try-with-resources, which interface must it implement?',
    options: opts4(
      'java.io.Serializable',
      'java.lang.AutoCloseable',
      'java.lang.Runnable',
      'java.io.Flushable'
    ),
    correct: ['b'],
    explanation: 'A try-with-resources resource must implement AutoCloseable (or its subinterface Closeable). The compiler generates an automatic close() call in reverse declaration order.',
    references: [REF_TWR]
  },
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about overriding and checked exceptions is TRUE?',
    options: opts4(
      'An overriding method may declare broader checked exceptions than the overridden method',
      'An overriding method may declare the same, narrower, or no checked exceptions, but not broader ones',
      'An overriding method must declare exactly the same exceptions',
      'Overriding methods can never throw exceptions'
    ),
    correct: ['b'],
    explanation: 'An overriding method may throw the same checked exceptions, subclasses of them, or fewer/none — but it cannot declare new or broader checked exceptions than the method it overrides.',
    references: [REF_JLS_CLASS, REF_EXCEPTIONS]
  },
  {
    domain: EXC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'If both the try block and a try-with-resources resource\'s close() throw, the close() exception is added as a suppressed exception of the primary (try-block) exception. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'In try-with-resources, the exception from the try block is primary; exceptions thrown by close() are suppressed and attached to it, retrievable via Throwable.getSuppressed().',
    references: [REF_TWR, REF_THROWABLE]
  },

  // ── Working with Arrays and Collections (7) ──
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    int[][] g = new int[2][3];\n    System.out.println(g.length + " " + g[0].length);',
    options: opts4(
      '2 3',
      '3 2',
      '6 0',
      '2 0'
    ),
    correct: ['a'],
    explanation: 'new int[2][3] creates a 2-element array of int[3] arrays. g.length is the outer dimension (2) and g[0].length is the inner dimension (3).',
    references: [REF_ARRAYS]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var s = new java.util.TreeSet<Integer>();\n    s.add(5); s.add(1); s.add(3); s.add(1);\n    System.out.println(s);',
    options: opts4(
      '[5, 1, 3, 1]',
      '[1, 1, 3, 5]',
      '[1, 3, 5]',
      '[5, 3, 1]'
    ),
    correct: ['c'],
    explanation: 'TreeSet stores unique elements in ascending sorted order. The duplicate 1 is ignored, and elements are ordered, yielding [1, 3, 5].',
    references: [REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What happens when iterating a List with an enhanced for loop and calling list.remove(x) inside it?',
    options: opts4(
      'It safely removes the element',
      'A ConcurrentModificationException is typically thrown',
      'It always throws IndexOutOfBoundsException',
      'It compiles but silently skips removal'
    ),
    correct: ['b'],
    explanation: 'Structurally modifying a collection during enhanced-for iteration invalidates the iterator and typically triggers a fail-fast ConcurrentModificationException. Use Iterator.remove() or removeIf instead.',
    references: [REF_LIST, REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which method removes all elements matching a predicate from a List?',
    options: opts4(
      'list.filter(p)',
      'list.removeIf(p)',
      'list.deleteAll(p)',
      'list.dropWhile(p)'
    ),
    correct: ['b'],
    explanation: 'Collection.removeIf(Predicate) removes every element for which the predicate returns true and reports whether any were removed. filter is a Stream operation; the others are not List methods.',
    references: [REF_LIST]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Map.getOrDefault("k", -1) return when key "k" is absent?',
    options: opts4(
      'null',
      '-1',
      'It throws NoSuchElementException',
      '0'
    ),
    correct: ['b'],
    explanation: 'getOrDefault returns the mapped value if the key is present (and mapped to non-null), otherwise it returns the supplied default, here -1.',
    references: [REF_MAP]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is TRUE about Collections.unmodifiableList(list)?',
    options: opts4(
      'It deep-copies the list',
      'It returns a read-only view; mutating the backing list still reflects through it',
      'It makes the elements immutable',
      'Calling get() throws UnsupportedOperationException'
    ),
    correct: ['b'],
    explanation: 'unmodifiableList returns an unmodifiable view backed by the original list. Mutating the original is visible through the view; only modifications via the view throw UnsupportedOperationException. Elements themselves are not made immutable.',
    references: [REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A HashSet permits at most one null element and does not maintain any predictable iteration order. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'HashSet allows a single null and provides no ordering guarantee for iteration. For ordering use LinkedHashSet (insertion order) or TreeSet (sorted, no null with natural ordering).',
    references: [REF_COLLECTIONS]
  },

  // ── Working with Streams and Lambda Expressions (9) ──
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    long c = java.util.stream.Stream.of("a", "bb", "ccc")\n        .filter(s -> s.length() > 1)\n        .count();\n    System.out.println(c);',
    options: opts4(
      '1',
      '2',
      '3',
      '0'
    ),
    correct: ['b'],
    explanation: 'filter keeps strings with length greater than 1: "bb" and "ccc". count() returns 2 as a long.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the difference between map and flatMap on a Stream?',
    options: opts4(
      'They are identical',
      'flatMap maps each element to a stream and flattens the results into one stream; map produces one element per element',
      'map flattens nested streams while flatMap does not',
      'flatMap can only be used on IntStream'
    ),
    correct: ['b'],
    explanation: 'map applies a one-to-one function. flatMap applies a function returning a Stream for each element and concatenates (flattens) those streams into a single stream — useful for nested collections.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var avg = java.util.stream.IntStream.of(2, 4, 6).average();\n    System.out.println(avg.getAsDouble());',
    options: opts4(
      '4.0',
      '12.0',
      '3.0',
      'It does not compile'
    ),
    correct: ['a'],
    explanation: 'IntStream.average() returns an OptionalDouble; for 2, 4, 6 the average is (2+4+6)/3 = 4.0, unwrapped by getAsDouble().',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which functional interface matches the lambda "() -> 42"?',
    options: opts4(
      'Supplier<Integer>',
      'Consumer<Integer>',
      'Function<Integer,Integer>',
      'Runnable'
    ),
    correct: ['a'],
    explanation: 'A no-argument lambda returning a value matches Supplier<T> (T get()). Runnable\'s run() returns void, Consumer takes an argument and returns void, and Function takes an argument.',
    references: [REF_FUNCTION]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Optional.ofNullable(null).orElseGet(() -> "x") return?',
    options: opts4(
      'null',
      '"x"',
      'It throws NoSuchElementException',
      'Optional.empty()'
    ),
    correct: ['b'],
    explanation: 'Optional.ofNullable(null) produces an empty Optional. orElseGet invokes the supplier when the value is absent, returning "x".',
    references: [REF_OPTIONAL]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var p = java.util.stream.Stream.of(1,2,3,4)\n        .collect(java.util.stream.Collectors.partitioningBy(n -> n % 2 == 0));\n    System.out.println(p.get(true));',
    options: opts4(
      '[1, 3]',
      '[2, 4]',
      '[1, 2, 3, 4]',
      'null'
    ),
    correct: ['b'],
    explanation: 'Collectors.partitioningBy splits elements into a Map<Boolean,List> with keys true (predicate satisfied) and false. The true bucket holds even numbers [2, 4].',
    references: [REF_COLLECTORS]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid method reference equivalent to s -> s.toUpperCase()?',
    options: opts4(
      'String::toUpperCase',
      'String.toUpperCase()',
      's::toUpperCase',
      '::toUpperCase'
    ),
    correct: ['a'],
    explanation: 'An instance-method reference on an arbitrary object of a type is written Type::method, so String::toUpperCase is equivalent to s -> s.toUpperCase(). The other forms are not valid method-reference syntax in this context.',
    references: [REF_LAMBDA]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Stream.iterate(1, n -> n * 2).limit(4).forEach(System.out::print) print?',
    options: opts4(
      '1248',
      '12345678',
      '2468',
      'It runs forever'
    ),
    correct: ['a'],
    explanation: 'Stream.iterate generates an infinite sequence 1, 2, 4, 8, ...; limit(4) truncates it to the first four elements 1, 2, 4, 8, which forEach prints as "1248".',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A lambda body may reference local variables only if they are final or effectively final. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A lambda (like an anonymous class) can capture local variables only if they are final or effectively final (never reassigned after initialization). Mutating a captured local would be a compile error.',
    references: [REF_LAMBDA]
  },

  // ── Java Platform Module System (5) ──
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which directive declares that a module depends on another named module?',
    options: opts4(
      'imports M;',
      'requires M;',
      'uses M;',
      'needs M;'
    ),
    correct: ['b'],
    explanation: 'The "requires M;" directive declares a dependency on module M, establishing readability. "imports" is not a module directive; "uses" relates to services; "needs" does not exist.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the difference between "exports pkg;" and "opens pkg;"?',
    options: opts4(
      'They are identical',
      'exports grants compile/run access to public API; opens grants deep reflective access at runtime',
      'opens grants compile-time access only',
      'exports allows reflection but not normal access'
    ),
    correct: ['b'],
    explanation: 'exports makes a package\'s public types accessible for normal compilation and execution. opens grants runtime reflective access (including to non-public members) without exporting the package for normal use.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the implicit module that every module reads without declaring it?',
    options: opts4(
      'java.sql',
      'java.base',
      'java.logging',
      'java.desktop'
    ),
    correct: ['b'],
    explanation: 'java.base is the foundational module (java.lang, java.util, etc.) that every module implicitly requires; you never need to declare "requires java.base;". Other modules must be required explicitly.',
    references: [REF_JPMS, REF_MODULE]
  },
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool analyzes class and module dependencies, helping identify uses of internal JDK APIs?',
    options: opts4(
      'jlink',
      'jdeps',
      'jmod',
      'jshell'
    ),
    correct: ['b'],
    explanation: 'jdeps is the Java class/module dependency analyzer; it can flag dependencies on internal/JDK-private APIs. jlink builds runtime images, jmod manages JMOD files, and jshell is the REPL.',
    references: [REF_JDEPS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Code on the classpath is placed in the unnamed module, which can read all modules but cannot be required by named modules. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Classpath code resides in the unnamed module. It reads every observable module, but named modules cannot express a dependency on the unnamed module, so library code must be modular to be required.',
    references: [REF_JPMS]
  },

  // ── Concurrency (6) ──
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does Future.get() do?',
    options: opts4(
      'Returns immediately with null if the task is unfinished',
      'Blocks until the task completes and then returns its result',
      'Cancels the task',
      'Starts the task'
    ),
    correct: ['b'],
    explanation: 'Future.get() blocks the calling thread until the asynchronous computation completes, then returns its result (or throws ExecutionException wrapping the task\'s exception).',
    references: [REF_EXECUTOR, REF_CONCURRENT]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about a synchronized instance method is TRUE?',
    options: opts4(
      'It locks the Class object',
      'It acquires the intrinsic lock on "this" for the duration of the method',
      'It prevents the object from being garbage collected',
      'It makes all fields volatile'
    ),
    correct: ['b'],
    explanation: 'A synchronized instance method acquires the intrinsic monitor lock of the instance (this) on entry and releases it on exit. A synchronized static method instead locks the Class object.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does shutdown() on an ExecutorService do?',
    options: opts4(
      'Immediately interrupts running tasks and discards queued ones',
      'Initiates an orderly shutdown: previously submitted tasks run but no new tasks are accepted',
      'Blocks until all tasks finish',
      'Restarts the pool'
    ),
    correct: ['b'],
    explanation: 'shutdown() begins an orderly shutdown — already submitted tasks (running and queued) complete, but new submissions are rejected. shutdownNow() attempts to stop running tasks and returns the queued ones.',
    references: [REF_EXECUTOR]
  },
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which class provides a thread-safe counter without using synchronized blocks?',
    options: opts4(
      'java.util.concurrent.atomic.AtomicLong',
      'java.lang.Long',
      'java.util.concurrent.CountDownLatch',
      'java.lang.ThreadLocal'
    ),
    correct: ['a'],
    explanation: 'AtomicLong offers lock-free atomic operations (incrementAndGet, addAndGet, compareAndSet) for a long counter. CountDownLatch is a one-shot synchronizer; ThreadLocal gives per-thread values.',
    references: [REF_ATOMIC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a deadlock?',
    options: opts4(
      'A thread that runs forever in a loop',
      'Two or more threads each waiting indefinitely for a lock held by another, so none can proceed',
      'A task that completes too slowly',
      'A thread that throws an uncaught exception'
    ),
    correct: ['b'],
    explanation: 'A deadlock occurs when threads form a cycle of lock dependencies — each holds a lock the other needs and waits forever. Consistent lock ordering or timeouts help avoid it.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Calling Thread.sleep(1000) pauses the current thread for about one second but does not release any monitor locks it holds. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Thread.sleep suspends the current thread for the given time without releasing held intrinsic locks. Only Object.wait releases the monitor of the object on which it is called.',
    references: [REF_CONC]
  },

  // ── Database Applications with JDBC (5) ──
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which class is typically used to obtain a Connection from a JDBC URL?',
    options: opts4(
      'java.sql.DriverManager',
      'java.sql.ResultSet',
      'java.sql.Statement',
      'java.sql.SQLException'
    ),
    correct: ['a'],
    explanation: 'DriverManager.getConnection(url, user, password) returns a Connection to the database identified by the JDBC URL. ResultSet/Statement operate on an existing connection.',
    references: [REF_JDBC, REF_CONNECTION]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'When binding a parameter to a PreparedStatement, what is the index of the first "?" placeholder?',
    options: opts4(
      '0',
      '1',
      'It depends on the driver',
      '-1'
    ),
    correct: ['b'],
    explanation: 'JDBC parameter indexes are 1-based: the first "?" is index 1, e.g., ps.setString(1, name). Using 0 throws SQLException.',
    references: [REF_PREPSTMT]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ResultSet getter retrieves an int column by its 1-based position?',
    options: opts4(
      'rs.getInt(int columnIndex)',
      'rs.readInt(int)',
      'rs.getColumn(int)',
      'rs.nextInt(int)'
    ),
    correct: ['a'],
    explanation: 'ResultSet.getInt(int columnIndex) returns the int value of the designated column (1-based) in the current row. There is no readInt/getColumn/nextInt on ResultSet.',
    references: [REF_RESULTSET]
  },
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE,
    stem: 'After an error mid-transaction with auto-commit disabled, which call discards the uncommitted changes?',
    options: opts4(
      'conn.reset()',
      'conn.rollback()',
      'conn.undo()',
      'conn.clear()'
    ),
    correct: ['b'],
    explanation: 'Connection.rollback() undoes all changes made in the current transaction since the last commit, returning the database to a consistent state. There is no reset/undo/clear on Connection.',
    references: [REF_CONNECTION]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'With JDBC 4.0+ and the service-provider mechanism, an explicit Class.forName("driver") call is generally no longer required to load the driver. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Since JDBC 4.0, drivers on the classpath are auto-loaded via the ServiceLoader mechanism, so an explicit Class.forName to register the driver is usually unnecessary.',
    references: [REF_JDBC]
  },

  // ── Localization (6) ──
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which builder-style API constructs a Locale for language "en" and region "US" in Java 17?',
    options: opts4(
      'new Locale.Builder().setLanguage("en").setRegion("US").build()',
      'Locale.create("en_US")',
      'new Locale.Factory("en", "US")',
      'Locale.parse("en-US")'
    ),
    correct: ['a'],
    explanation: 'Locale.Builder provides a fluent API: setLanguage/setRegion/build. There is no Locale.create, Locale.Factory, or Locale.parse; the legacy alternative is the new Locale("en", "US") constructor.',
    references: [REF_LOCALE]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'What does NumberFormat.getPercentInstance(Locale.US).format(0.25) produce?',
    options: opts4(
      '0.25',
      '25%',
      '25',
      '0.25%'
    ),
    correct: ['b'],
    explanation: 'A percent NumberFormat multiplies the value by 100 and appends the locale percent symbol, so 0.25 is formatted as "25%".',
    references: [REF_NUMBERFORMAT]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'A property resource bundle base name is "Msg". Which file does ResourceBundle.getBundle("Msg", Locale.FRENCH) look for FIRST?',
    options: opts4(
      'Msg.properties',
      'Msg_fr.properties',
      'Msg_en.properties',
      'Msg_fr_FR.properties'
    ),
    correct: ['b'],
    explanation: 'Locale.FRENCH has language "fr" and no country. The search starts at the most specific candidate, which here is Msg_fr.properties, before falling back to the base Msg.properties.',
    references: [REF_RESOURCEBUNDLE]
  },
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE,
    stem: 'Which method returns a human-readable, localized name of a Locale\'s language?',
    options: opts4(
      'locale.getLanguage()',
      'locale.getDisplayLanguage()',
      'locale.toLanguageTag()',
      'locale.getISO3Language()'
    ),
    correct: ['b'],
    explanation: 'getDisplayLanguage() returns a localized, human-readable name (e.g., "French"). getLanguage() returns the ISO code "fr"; toLanguageTag() returns a BCP 47 tag; getISO3Language() returns a 3-letter code.',
    references: [REF_LOCALE]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Which formatter call produces a date string localized for a specific Locale using a medium style?',
    options: opts4(
      'DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale)',
      'DateTimeFormatter.ofPattern("yyyy-MM-dd")',
      'new SimpleDateFormat()',
      'DateTimeFormatter.ISO_LOCAL_DATE'
    ),
    correct: ['a'],
    explanation: 'ofLocalizedDate(FormatStyle.MEDIUM) creates a locale-sensitive formatter; withLocale binds the desired Locale. A fixed ofPattern or ISO formatter is not locale-sensitive in its layout.',
    references: [REF_DATETIMEFMT]
  },
  {
    domain: L10N, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'ResourceBundle.getBundle falls back to the JVM default locale\'s bundle, and then to the base bundle, before throwing MissingResourceException. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'The default control searches the requested locale, then the default locale candidates, then the base bundle. Only if none of these resources exist (and no fallback resolves the key) is MissingResourceException thrown.',
    references: [REF_RESOURCEBUNDLE]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Handling Date, Time, Text, Numeric and Boolean Values (5) ──
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    var d = java.time.LocalDate.of(2024, 2, 29);\n    System.out.println(d.plusYears(1));',
    options: opts4(
      '2025-02-29',
      '2025-02-28',
      '2025-03-01',
      'A DateTimeException is thrown'
    ),
    correct: ['b'],
    explanation: 'Adding one year to a Feb 29 leap day lands in a non-leap year (2025); LocalDate adjusts the invalid Feb 29 to the last valid day, Feb 28, rather than throwing.',
    references: [REF_LOCALDATE]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    System.out.println(5 / 2 + " " + 5 % 2 + " " + 5.0 / 2);',
    options: opts4(
      '2 1 2.5',
      '2.5 1 2.5',
      '2 1 2',
      '2.5 0 2.5'
    ),
    correct: ['a'],
    explanation: 'Integer division 5 / 2 is 2, 5 % 2 (remainder) is 1, and 5.0 / 2 promotes to double yielding 2.5. String concatenation joins them as "2 1 2.5".',
    references: [REF_JLS_NUM, REF_JLS_EXPR]
  },
  {
    domain: DTV, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "Hello".substring(1, 3) return?',
    options: opts4(
      '"He"',
      '"el"',
      '"ell"',
      '"Hel"'
    ),
    correct: ['b'],
    explanation: 'substring(beginIndex, endIndex) returns characters from beginIndex inclusive to endIndex exclusive. Indexes 1 and 3 of "Hello" give characters at 1 ("e") and 2 ("l") → "el".',
    references: [REF_STRING]
  },
  {
    domain: DTV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    long big = 2_147_483_647 + 1;\n    System.out.println(big);',
    options: opts4(
      '2147483648',
      '-2147483648',
      'It does not compile',
      '2147483647'
    ),
    correct: ['b'],
    explanation: 'The literals are int; 2147483647 is Integer.MAX_VALUE, and adding 1 overflows in int arithmetic to Integer.MIN_VALUE (-2147483648) BEFORE the widening assignment to long. Underscores in literals are cosmetic.',
    references: [REF_JLS_NUM]
  },
  {
    domain: DTV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'java.time.Duration measures time-based amounts (seconds/nanos) while java.time.Period measures date-based amounts (years/months/days). True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Duration represents a time-based amount such as seconds and nanoseconds; Period represents a date-based amount of years, months, and days. They are not interchangeable.',
    references: [REF_DURATION, REF_PERIOD]
  },

  // ── Controlling Program Flow (5) ──
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    int x = 10;\n    if (x > 5)\n        if (x > 20) System.out.print("A");\n        else System.out.print("B");',
    options: opts4(
      'A',
      'B',
      'AB',
      'Nothing'
    ),
    correct: ['b'],
    explanation: 'The dangling else binds to the nearest preceding if (the inner "if (x > 20)"). x is 10, so x > 20 is false and the inner else runs, printing "B".',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    int i = 0;\n    while (i++ < 3) System.out.print(i);',
    options: opts4(
      '012',
      '123',
      '0123',
      '1234'
    ),
    correct: ['b'],
    explanation: 'i++ evaluates to the value before increment for the comparison, then i is incremented. Tests: 0<3 (i=1) print 1; 1<3 (i=2) print 2; 2<3 (i=3) print 3; 3<3 false. Output is "123".',
    references: [REF_JLS_STMT, REF_JLS_EXPR]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is TRUE about a switch statement on a String selector?',
    options: opts4(
      'Comparison uses == identity',
      'Comparison uses String.equals semantics; a null selector throws NullPointerException',
      'String selectors are not allowed',
      'It is case-insensitive'
    ),
    correct: ['b'],
    explanation: 'A String switch compares using equals (not ==) and is case-sensitive. Switching on a null String reference throws NullPointerException when the selector is evaluated.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'What is printed?\n\n    for (int i = 0; ; i++) {\n        if (i == 2) break;\n        System.out.print(i);\n    }',
    options: opts4(
      '01',
      '012',
      'It does not compile because the condition is missing',
      'It loops forever'
    ),
    correct: ['a'],
    explanation: 'A for loop with an omitted condition is treated as always true. The loop prints 0 and 1, then breaks when i == 2, producing "01". The empty condition is legal Java.',
    references: [REF_JLS_STMT]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'In Java 17, a traditional colon-style switch statement still allows fall-through between case labels when break is omitted. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Colon-style switch labels fall through to subsequent cases unless a break (or return/throw) terminates the case. Only the newer arrow-label switch has no fall-through.',
    references: [REF_JLS_STMT]
  },

  // ── Java Object-Oriented Approach (12) ──
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about "final" applied to a variable is TRUE?',
    options: opts4(
      'A final field can be reassigned in any method',
      'A final variable must be assigned exactly once and cannot be reassigned afterward',
      'final makes the referenced object immutable',
      'final can only be applied to primitives'
    ),
    correct: ['b'],
    explanation: 'final means the variable can be assigned exactly once (at declaration, in a constructor, or initializer for fields). It prevents reassignment of the variable but does not make a referenced object immutable.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    class A { int f() { return 1; } }\n    class B extends A { int f() { return super.f() + 10; } }\n    System.out.println(new B().f());',
    options: opts4(
      '1',
      '10',
      '11',
      'It does not compile'
    ),
    correct: ['c'],
    explanation: 'B.f() invokes A.f() via super.f() (returns 1) and adds 10, returning 11. super lets an overriding method reuse the superclass implementation.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given "non-sealed class Square extends Shape" where Shape is sealed, which is TRUE?',
    options: opts4(
      'Square cannot be subclassed',
      'Square reopens the hierarchy: it may be freely extended by any class',
      'non-sealed is not a valid modifier',
      'Square must also be sealed'
    ),
    correct: ['b'],
    explanation: 'A permitted subtype declared non-sealed removes the sealing restriction for itself, allowing it to be extended by any class, effectively reopening that branch of the hierarchy.',
    references: [REF_SEALED]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE of an anonymous class?',
    options: opts4(
      'It can declare a constructor',
      'It can extend a class or implement exactly one interface, but is unnamed',
      'It can implement multiple interfaces',
      'It can be declared static'
    ),
    correct: ['b'],
    explanation: 'An anonymous class is defined and instantiated in one expression; it either extends one class or implements one interface and has no name. It cannot declare a constructor (it has no name) or implement multiple interfaces.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    String s = null;\n    System.out.println("v=" + s);',
    options: opts4(
      'v=',
      'v=null',
      'It throws NullPointerException',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'String concatenation converts a null reference to the literal text "null". So "v=" + s yields "v=null"; no NullPointerException occurs in string concatenation.',
    references: [REF_JLS_EXPR, REF_STRING]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which keyword refers to the current object instance within an instance method?',
    options: opts4(
      'self',
      'this',
      'current',
      'me'
    ),
    correct: ['b'],
    explanation: 'this is the implicit reference to the current object within an instance method or constructor. Java has no self/current/me keyword for this purpose.',
    references: [REF_JLS_EXPR]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the result of overriding equals(Object) without overriding hashCode() and then using the type as a HashMap key?',
    options: opts4(
      'Compilation error',
      'Lookups may fail because equal objects can have different hash codes, breaking the hashCode/equals contract',
      'hashCode is auto-derived from equals',
      'HashMap ignores hashCode entirely'
    ),
    correct: ['b'],
    explanation: 'The contract requires equal objects to have equal hash codes. Overriding only equals can leave equal objects in different buckets, so HashMap get may not find a logically equal key. Always override both together.',
    references: [REF_OBJECTS]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which access modifier allows access from the same package and from subclasses in other packages?',
    options: opts4(
      'private',
      'protected',
      'public',
      'package-private (no modifier)'
    ),
    correct: ['b'],
    explanation: 'protected members are accessible within the same package and by subclasses (even in different packages). package-private is same-package only; public is unrestricted; private is class-only.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var p = new java.util.concurrent.atomic.AtomicInteger(0);\n    record R(String n) {}\n    System.out.println(new R("x").equals(new R("x")));',
    options: opts4(
      'false',
      'true',
      'It does not compile because records cannot be local',
      'It throws an exception'
    ),
    correct: ['b'],
    explanation: 'Records may be declared locally inside a method (Java 16+). R has a single component n; the generated equals compares components, so R("x") equals R("x") is true.',
    references: [REF_RECORDS]
  },
  {
    domain: OO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about a constructor calling this(...) as its first statement?',
    options: opts4(
      'It invokes the superclass constructor',
      'It invokes another constructor in the same class (constructor chaining)',
      'It is illegal Java',
      'It must be the last statement'
    ),
    correct: ['b'],
    explanation: 'this(...) as the first statement delegates to another constructor of the same class (constructor chaining). super(...) targets the superclass. Either may appear only as the first statement.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A nested static class does not hold an implicit reference to an instance of its enclosing class, whereas a non-static inner class does. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A static nested class is associated with the outer class itself and has no implicit outer instance. A (non-static) inner class holds an implicit reference to an enclosing instance and needs one to be created.',
    references: [REF_JLS_CLASS]
  },
  {
    domain: OO, difficulty: 3, type: QType.SINGLE,
    stem: 'Given generic method "static <T extends Comparable<T>> T max(T a, T b)", which call is valid?',
    options: opts4(
      'max("a", "b")',
      'max(new Object(), new Object())',
      'max(1, "x")',
      'max(null, null) with no inference hint'
    ),
    correct: ['a'],
    explanation: 'String implements Comparable<String>, so max("a","b") satisfies the bound. Object is not Comparable; mixed String/int cannot infer a single T; max(null,null) with no target type cannot infer the bound.',
    references: [REF_GENERICS]
  },

  // ── Exception Handling (5) ──
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    try {\n        int[] a = new int[2];\n        System.out.print(a[5]);\n    } catch (ArrayIndexOutOfBoundsException e) {\n        System.out.print("AIOOBE");\n    }',
    options: opts4(
      '0',
      'AIOOBE',
      'It does not compile',
      'Nothing'
    ),
    correct: ['b'],
    explanation: 'Accessing index 5 of a length-2 array throws ArrayIndexOutOfBoundsException at runtime, which the catch handles, printing "AIOOBE".',
    references: [REF_EXCEPTIONS]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ordering of catch blocks for IOException and FileNotFoundException compiles?',
    options: opts4(
      'catch (IOException e) then catch (FileNotFoundException e)',
      'catch (FileNotFoundException e) then catch (IOException e)',
      'Either order compiles',
      'They cannot both appear'
    ),
    correct: ['b'],
    explanation: 'FileNotFoundException is a subclass of IOException. The more specific subclass must be caught before the broader superclass; reversing the order makes the second catch unreachable, a compile error.',
    references: [REF_EXCEPTIONS, REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Throwable.getCause() return for an exception created with new RuntimeException("x") (no cause)?',
    options: opts4(
      'A new RuntimeException',
      'null',
      'The same RuntimeException (self-reference)',
      'It throws IllegalStateException'
    ),
    correct: ['b'],
    explanation: 'If no cause was set (via the cause constructor or initCause), getCause() returns null. Exception chaining is established only when a cause is explicitly provided.',
    references: [REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an Error rather than an Exception?',
    options: opts4(
      'java.lang.ArithmeticException',
      'java.lang.StackOverflowError',
      'java.io.IOException',
      'java.lang.NumberFormatException'
    ),
    correct: ['b'],
    explanation: 'StackOverflowError extends Error, representing a serious abnormal condition not normally caught by applications. The others extend Exception (RuntimeException or checked).',
    references: [REF_THROWABLE]
  },
  {
    domain: EXC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A method that declares "throws IOException" but never actually throws it still compiles in Java. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A throws clause declares the maximum set of checked exceptions a method may propagate; it is legal to declare a checked exception even if the body never throws it (callers must still handle/declare it).',
    references: [REF_EXCEPTIONS]
  },

  // ── Working with Arrays and Collections (7) ──
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the default value of each element in "new boolean[3]"?',
    options: opts4(
      'true',
      'false',
      'null',
      '0'
    ),
    correct: ['b'],
    explanation: 'Array elements are initialized to their type\'s default. For boolean the default is false (numeric types default to 0, references to null).',
    references: [REF_ARRAYS]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var list = new java.util.ArrayList<>(java.util.List.of(1,2,3));\n    list.remove(Integer.valueOf(2));\n    System.out.println(list);',
    options: opts4(
      '[1, 3]',
      '[2, 3]',
      '[1, 2]',
      'It throws IndexOutOfBoundsException'
    ),
    correct: ['a'],
    explanation: 'remove(Object) removes the first element equal to the argument. Integer.valueOf(2) selects the remove(Object) overload (not remove(int index)), removing the value 2 and leaving [1, 3].',
    references: [REF_LIST]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is TRUE about the difference between remove(int) and remove(Object) on a List<Integer>?',
    options: opts4(
      'They are identical',
      'remove(int) removes by index; remove(Object) removes the first matching element — so remove(1) vs remove(Integer.valueOf(1)) differ',
      'remove(Object) removes by index',
      'List<Integer> only has remove(int)'
    ),
    correct: ['b'],
    explanation: 'list.remove(1) calls remove(int index) and removes the element at index 1; list.remove(Integer.valueOf(1)) calls remove(Object) and removes the first element equal to 1. This overload ambiguity is a classic trap.',
    references: [REF_LIST]
  },
  {
    domain: COLL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which call creates a fixed-size List view backed by an array a?',
    options: opts4(
      'List.copyOf(a)',
      'Arrays.asList(a)',
      'new ArrayList<>(a)',
      'Collections.emptyList()'
    ),
    correct: ['b'],
    explanation: 'Arrays.asList returns a fixed-size list backed by the supplied array; changes write through to the array. The other options copy or create unrelated lists.',
    references: [REF_ARRAYS, REF_LIST]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What does the Comparator "Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())" do?',
    options: opts4(
      'Sorts by natural order only',
      'Sorts by string length, breaking ties by natural (lexicographic) order',
      'Sorts by length descending',
      'It does not compile'
    ),
    correct: ['b'],
    explanation: 'comparingInt(String::length) orders by length; thenComparing adds a secondary natural-order comparison applied only when lengths are equal, giving a stable length-then-alphabetical ordering.',
    references: [REF_COMPARATOR]
  },
  {
    domain: COLL, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var q = new java.util.PriorityQueue<Integer>();\n    q.add(3); q.add(1); q.add(2);\n    System.out.println(q.poll());',
    options: opts4(
      '3',
      '1',
      '2',
      'null'
    ),
    correct: ['b'],
    explanation: 'A PriorityQueue with natural ordering is a min-heap; poll() retrieves and removes the least element. The smallest of 3, 1, 2 is 1.',
    references: [REF_COLLECTIONS]
  },
  {
    domain: COLL, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'An ArrayList provides amortized O(1) random access by index, while a LinkedList provides O(n) index access but O(1) insertion at the ends. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'ArrayList is array-backed: O(1) get by index. LinkedList is a doubly-linked list: index access is O(n) (must traverse), but adding/removing at the head or tail is O(1).',
    references: [REF_LIST, REF_COLLECTIONS]
  },

  // ── Working with Streams and Lambda Expressions (9) ──
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is printed?\n\n    var sum = java.util.stream.Stream.of(1,2,3,4,5)\n        .mapToInt(Integer::intValue)\n        .filter(n -> n > 2)\n        .sum();\n    System.out.println(sum);',
    options: opts4(
      '12',
      '15',
      '9',
      '3'
    ),
    correct: ['a'],
    explanation: 'mapToInt converts to IntStream; filter keeps 3, 4, 5; sum() returns 3 + 4 + 5 = 12.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Stream.of(1,2,3).peek(System.out::print).map(n -> n + 1).count() print to standard output in Java 17?',
    options: opts4(
      '123',
      'Nothing — count() may elide peek when the size is known and map has no side-effect-relevant impact',
      '234',
      'It throws an exception'
    ),
    correct: ['b'],
    explanation: 'Since the source size is known and the operations do not affect the count, the JDK may skip traversal, so peek\'s side effect may not execute. peek is intended for debugging, not guaranteed execution.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is printed?\n\n    var r = java.util.stream.Stream.of("a","bb","ccc")\n        .collect(java.util.stream.Collectors.toMap(s -> s, String::length));\n    System.out.println(r.get("bb"));',
    options: opts4(
      '1',
      '2',
      '3',
      'null'
    ),
    correct: ['b'],
    explanation: 'Collectors.toMap builds a Map using the first lambda as key and the second as value. The value for key "bb" is its length, 2.',
    references: [REF_COLLECTORS]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which functional interface represents an operation taking two arguments of the same type and returning that type?',
    options: opts4(
      'BinaryOperator<T>',
      'UnaryOperator<T>',
      'BiPredicate<T,T>',
      'BiConsumer<T,T>'
    ),
    correct: ['a'],
    explanation: 'BinaryOperator<T> extends BiFunction<T,T,T>: it takes two T operands and returns a T (e.g., Integer::sum). UnaryOperator is single-argument; BiPredicate returns boolean; BiConsumer returns void.',
    references: [REF_FUNCTION]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does Optional.of(5).map(n -> n * 2).filter(n -> n > 100).orElse(-1) return?',
    options: opts4(
      '10',
      '-1',
      '5',
      'It throws NoSuchElementException'
    ),
    correct: ['b'],
    explanation: 'map yields Optional[10]; filter keeps it only if 10 > 100 (false), producing an empty Optional; orElse then returns the fallback -1.',
    references: [REF_OPTIONAL]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which terminal operation is a short-circuiting operation?',
    options: opts4(
      'forEach',
      'anyMatch',
      'collect',
      'reduce'
    ),
    correct: ['b'],
    explanation: 'anyMatch is short-circuiting: it stops processing as soon as a matching element is found. forEach, collect, and reduce must process the entire stream.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid constructor reference for an ArrayList<String>?',
    options: opts4(
      'ArrayList::new',
      'new ArrayList<>::',
      'ArrayList<String>.new',
      '::ArrayList'
    ),
    correct: ['a'],
    explanation: 'A constructor reference uses the form ClassName::new; ArrayList::new can serve as a Supplier<List<String>>. The other forms are not valid Java method/constructor reference syntax.',
    references: [REF_LAMBDA]
  },
  {
    domain: STREAM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does java.util.stream.Stream.generate(() -> 1).limit(3).reduce(0, Integer::sum) return?',
    options: opts4(
      '0',
      '3',
      '1',
      'It runs forever'
    ),
    correct: ['b'],
    explanation: 'Stream.generate produces an infinite stream of 1s; limit(3) takes three 1s; reduce with identity 0 and sum yields 1 + 1 + 1 = 3.',
    references: [REF_STREAM]
  },
  {
    domain: STREAM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'parallelStream() may process elements concurrently, so operations passed to it should be stateless and non-interfering to yield correct results. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'Parallel streams split work across threads; behavioral parameters must be stateless and non-interfering (and ideally side-effect free) or results become nondeterministic or incorrect.',
    references: [REF_STREAM]
  },

  // ── Java Platform Module System (5) ──
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a syntactically valid module declaration?',
    options: opts4(
      'module com.app { requires java.sql; exports com.app.api; }',
      'module com.app { import java.sql; }',
      'package com.app { requires java.sql; }',
      'module "com.app" { needs java.sql; }'
    ),
    correct: ['a'],
    explanation: 'A module declaration uses "module <name> { ... }" with directives like requires and exports. import/needs are not module directives, the name is an unquoted identifier, and package is unrelated.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which directive declares that a module provides an implementation of a service?',
    options: opts4(
      'uses com.api.Service;',
      'provides com.api.Service with com.impl.ServiceImpl;',
      'exports com.impl;',
      'requires com.api.Service;'
    ),
    correct: ['b'],
    explanation: 'A provider module uses "provides Interface with Impl;". Consumers declare "uses Interface;". exports/requires manage package and module dependencies, not service binding.',
    references: [REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.SINGLE,
    stem: 'What is an automatic module?',
    options: opts4(
      'A module generated by jlink',
      'A plain (non-modular) JAR placed on the module path; its name is derived from the JAR or Automatic-Module-Name manifest entry',
      'The java.base module',
      'A module that requires no dependencies'
    ),
    correct: ['b'],
    explanation: 'Placing a regular JAR (no module-info) on the module path makes it an automatic module: it reads all other modules, exports all its packages, and gets a name from Automatic-Module-Name or the JAR filename.',
    references: [REF_JPMS, REF_MODULE]
  },
  {
    domain: JPMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the modules resolved for an application?',
    options: opts4(
      'java --list-modules',
      'java --show-version',
      'javac --release',
      'jar --describe-module'
    ),
    correct: ['a'],
    explanation: 'java --list-modules prints the observable modules in the runtime. jar --describe-module describes a single modular JAR; the others report version or compile settings.',
    references: [REF_MODULE, REF_JPMS]
  },
  {
    domain: JPMS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A split package (the same package provided by two different named modules readable by a third) is not allowed by the module system. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'The module system forbids split packages: a given package must be defined by at most one named module observed by a module. Split packages cause module resolution/layer errors.',
    references: [REF_JPMS]
  },

  // ── Concurrency (6) ──
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which interface is the simplest task abstraction with a "void run()" method and no return value?',
    options: opts4(
      'Callable<V>',
      'Runnable',
      'Future<V>',
      'Supplier<V>'
    ),
    correct: ['b'],
    explanation: 'Runnable declares void run() and cannot return a value or throw checked exceptions. Callable returns a value, Future represents a pending result, and Supplier is a value producer not a task.',
    references: [REF_CONC, REF_CONCURRENT]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does CompletableFuture.supplyAsync(() -> 1).thenApply(x -> x + 1).join() return?',
    options: opts4(
      '1',
      '2',
      'null',
      'It throws immediately'
    ),
    correct: ['b'],
    explanation: 'supplyAsync runs the supplier asynchronously yielding 1; thenApply transforms it to 1 + 1 = 2; join() blocks and returns the completed result, 2.',
    references: [REF_CONCURRENT]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the role of a CountDownLatch initialized with count 3?',
    options: opts4(
      'It allows 3 threads to run simultaneously then resets',
      'Threads calling await() block until countDown() has been called 3 times, then all proceed',
      'It schedules a task after 3 seconds',
      'It limits the thread pool to 3 threads'
    ),
    correct: ['b'],
    explanation: 'A CountDownLatch(3) makes await() block until countDown() has been invoked three times bringing the count to zero, at which point all waiting threads are released. It is a one-shot gate.',
    references: [REF_CONCURRENT]
  },
  {
    domain: CONC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about the Object.wait()/notify() mechanism is TRUE?',
    options: opts4(
      'wait() can be called without holding the object\'s monitor',
      'wait() must be called from within a synchronized block/method on that object and releases its monitor while waiting',
      'notify() wakes all waiting threads',
      'wait() never releases the lock'
    ),
    correct: ['b'],
    explanation: 'wait() must be invoked while holding the object\'s intrinsic lock; it atomically releases the monitor and suspends the thread until notified. notify() wakes one waiting thread; notifyAll() wakes all.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does a race condition refer to?',
    options: opts4(
      'A thread running faster than expected',
      'Program behavior depending on the nondeterministic timing/interleaving of threads accessing shared mutable state',
      'A thread that never terminates',
      'Two threads with the same name'
    ),
    correct: ['b'],
    explanation: 'A race condition arises when correctness depends on the relative timing/interleaving of threads operating on shared mutable state without adequate synchronization, producing nondeterministic results.',
    references: [REF_CONC]
  },
  {
    domain: CONC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A thread that has terminated cannot be restarted; calling start() on it again throws IllegalThreadStateException. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'A Thread can be started at most once. Invoking start() on a thread that has already been started (or has finished) throws IllegalThreadStateException.',
    references: [REF_CONC]
  },

  // ── Database Applications with JDBC (5) ──
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which try-with-resources pattern correctly manages JDBC objects?',
    options: opts4(
      'try (Connection c = ...; PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) { }',
      'try { Connection c = ...; } catch (SQLException e) { }',
      'Connection c = ...; try { } finally { }',
      'try (sql) { }'
    ),
    correct: ['a'],
    explanation: 'Connection, PreparedStatement, and ResultSet all implement AutoCloseable, so declaring them in a try-with-resources header guarantees they are closed in reverse order even if an exception occurs.',
    references: [REF_TWR, REF_JDBC]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Statement method returns true if the first result is a ResultSet (as opposed to an update count)?',
    options: opts4(
      'execute(String sql)',
      'executeQuery(String sql)',
      'executeUpdate(String sql)',
      'getMoreResults()'
    ),
    correct: ['a'],
    explanation: 'Statement.execute returns a boolean: true if the result is a ResultSet (retrieve via getResultSet), false if it is an update count. It is used for SQL whose form is unknown at compile time.',
    references: [REF_CONNECTION, REF_JDBC]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ResultSet type allows the cursor to move both forward and backward?',
    options: opts4(
      'ResultSet.TYPE_FORWARD_ONLY',
      'ResultSet.TYPE_SCROLL_INSENSITIVE',
      'ResultSet.CONCUR_READ_ONLY',
      'ResultSet.CLOSE_CURSORS_AT_COMMIT'
    ),
    correct: ['b'],
    explanation: 'TYPE_SCROLL_INSENSITIVE (and TYPE_SCROLL_SENSITIVE) produce a scrollable ResultSet supporting previous(), absolute(), etc. TYPE_FORWARD_ONLY only moves forward; CONCUR_* and CLOSE_* are concurrency/holdability constants.',
    references: [REF_RESULTSET]
  },
  {
    domain: JDBC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which method on PreparedStatement binds a String value to the second placeholder?',
    options: opts4(
      'ps.setString(2, value)',
      'ps.setParameter("2", value)',
      'ps.bindString(2, value)',
      'ps.set(2, value)'
    ),
    correct: ['a'],
    explanation: 'PreparedStatement.setString(int parameterIndex, String x) binds a String to the given 1-based placeholder; setString(2, value) targets the second "?". The other method names do not exist on PreparedStatement.',
    references: [REF_PREPSTMT]
  },
  {
    domain: JDBC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A batch of updates can be queued with addBatch() on a Statement/PreparedStatement and sent together with executeBatch(). True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'JDBC batch updates accumulate commands via addBatch() and submit them in one round trip with executeBatch(), which returns an int[] of per-command update counts, improving throughput.',
    references: [REF_JDBC, REF_PREPSTMT]
  },

  // ── Localization (6) ──
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does Locale.US.toString() return?',
    options: opts4(
      'US',
      'en_US',
      'en-US',
      'English (United States)'
    ),
    correct: ['b'],
    explanation: 'Locale.toString() yields the underscore-joined form of language and country, "en_US". The hyphenated BCP 47 form "en-US" comes from toLanguageTag(); the readable name from getDisplayName().',
    references: [REF_LOCALE]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct base/locale file naming for a French (France) properties bundle named "Labels"?',
    options: opts4(
      'Labels-fr-FR.properties',
      'Labels_fr_FR.properties',
      'Labels.fr.FR.properties',
      'fr_FR_Labels.properties'
    ),
    correct: ['b'],
    explanation: 'ResourceBundle property files use underscores: <baseName>_<language>_<country>.properties, e.g., Labels_fr_FR.properties. Hyphens or dots in that position are not recognized by the default control.',
    references: [REF_RESOURCEBUNDLE]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'What does NumberFormat.getInstance(Locale.GERMANY).format(1234.5) most likely produce?',
    options: opts4(
      '1,234.5',
      '1.234,5',
      '1234.5',
      '1 234.5'
    ),
    correct: ['b'],
    explanation: 'German locale uses "." as the grouping separator and "," as the decimal separator, so 1234.5 formats as "1.234,5". US locale would yield "1,234.5".',
    references: [REF_NUMBERFORMAT]
  },
  {
    domain: L10N, difficulty: 2, type: QType.SINGLE,
    stem: 'Which class is designed to load and select locale-specific objects/strings with a fallback hierarchy?',
    options: opts4(
      'java.util.ResourceBundle',
      'java.util.Scanner',
      'java.util.Formatter',
      'java.io.Properties'
    ),
    correct: ['a'],
    explanation: 'ResourceBundle is purpose-built for locale-specific resource loading with a defined parent/fallback chain. Scanner parses input, Formatter formats output, and Properties is a generic key/value store.',
    references: [REF_RESOURCEBUNDLE, REF_I18N]
  },
  {
    domain: L10N, difficulty: 3, type: QType.SINGLE,
    stem: 'Which produces a localized currency string for Locale.JAPAN given amount 1000?',
    options: opts4(
      'NumberFormat.getCurrencyInstance(Locale.JAPAN).format(1000)',
      'String.valueOf(1000)',
      'NumberFormat.getIntegerInstance().format(1000)',
      'Integer.toString(1000)'
    ),
    correct: ['a'],
    explanation: 'getCurrencyInstance(Locale.JAPAN) formats using the yen symbol and Japanese conventions (e.g., "￥1,000"). The other options produce plain numeric strings without locale currency formatting.',
    references: [REF_NUMBERFORMAT, REF_I18N]
  },
  {
    domain: L10N, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A ResourceBundle property file can have its keys read via getString(key), which throws MissingResourceException if the key is absent. True or False?',
    options: tf(),
    correct: ['a'],
    explanation: 'ResourceBundle.getString(key) returns the value for the key or throws MissingResourceException if the key cannot be found in the bundle or its parent chain.',
    references: [REF_RESOURCEBUNDLE]
  }
];

const JAVA17_DOMAINS = [
  { name: DTV, weight: 8 },
  { name: FLOW, weight: 8 },
  { name: OO, weight: 18 },
  { name: EXC, weight: 8 },
  { name: COLL, weight: 10 },
  { name: STREAM, weight: 14 },
  { name: JPMS, weight: 8 },
  { name: CONC, weight: 10 },
  { name: JDBC, weight: 8 },
  { name: L10N, weight: 8 }
];

const JAVA17_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'oracle-java-se-17-1z0-829-p1',
    code: '1Z0-829-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering dates/text/numbers, program flow, the object-oriented approach, exceptions, arrays & collections, streams & lambdas, the module system, concurrency, JDBC, and localization.',
    questions: P1
  },
  {
    slug: 'oracle-java-se-17-1z0-829-p2',
    code: '1Z0-829-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'oracle-java-se-17-1z0-829-p3',
    code: '1Z0-829-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const JAVA17_BUNDLE = {
  slug: 'oracle-java-se-17-1z0-829',
  title: 'Oracle Certified Professional: Java SE 17 Developer (1Z0-829)',
  description: 'All 3 Java SE 17 Developer (1Z0-829) practice exams in one bundle — covering dates/text/numbers, program flow, the object-oriented approach, exception handling, arrays & collections, streams & lambdas, the Java Platform Module System, concurrency, JDBC, and localization, aligned to the Oracle 1Z0-829 exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 24500 // USD 245 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Java SE 17 (1Z0-829) bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:java17-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedJava17(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'oracle' } });
  await db.vendor.upsert({
    where: { slug: 'oracle' },
    update: { name: 'Oracle', description: 'Oracle certifications — Java SE, database, and the Oracle Certified Professional credentials.' },
    create: { slug: 'oracle', name: 'Oracle', description: 'Oracle certifications — Java SE, database, and the Oracle Certified Professional credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'oracle' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of JAVA17_EXAMS) {
    const title = `Oracle Certified Professional: Java SE 17 Developer (1Z0-829) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Oracle 1Z0-829 exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 90,
      passingScore: 68,
      questionCount: e.questions.length,
      domains: JAVA17_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:java17-seed' } });
    let teaserCount = 0;
    for (const q of e.questions) {
      await db.question.create({
        data: {
          examId: exam.id,
          domain: q.domain,
          difficulty: q.difficulty,
          type: q.type,
          stem: q.stem,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          references: q.references,
          status: QStatus.PUBLISHED,
          generatedBy: 'manual:java17-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: JAVA17_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: JAVA17_BUNDLE.slug },
    update: {
      title: JAVA17_BUNDLE.title,
      description: JAVA17_BUNDLE.description,
      price: JAVA17_BUNDLE.price,
      priceVoucher: JAVA17_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: JAVA17_BUNDLE.slug,
      title: JAVA17_BUNDLE.title,
      description: JAVA17_BUNDLE.description,
      price: JAVA17_BUNDLE.price,
      priceVoucher: JAVA17_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'oracle-java-se-17-1z0-829-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'oracle-java-se-17-1z0-829-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'oracle-java-se-17-1z0-829-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'oracle-java-se-17-1z0-829-p1', tier: 'VOUCHER' as const, position: 4 }
  ];
  for (const it of items) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examIds[it.examSlug], tier: it.tier, position: it.position }
    });
  }

  return {
    vendor: existingVendor ? 'updated' : 'created',
    exams: examResults,
    bundle: existingBundle ? 'updated' : 'created'
  };
}
