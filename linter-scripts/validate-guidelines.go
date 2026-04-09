// Package main — Cross-Language Coding Guidelines Validator (Go Edition)
//
// A Go port of validate-guidelines.py that validates Go, PHP, TypeScript,
// and Rust source files against the coding guidelines defined in
// spec/02-coding-guidelines/03-coding-guidelines-spec/.
//
// Usage:
//
//	go run scripts/validate-guidelines.go [--path <dir>] [--json] [--max-lines <n>]
//
// Rules Enforced:
//
//	CODE-RED-001  No nested if statements
//	CODE-RED-002  Boolean naming (is/has/can/should/was prefix)
//	CODE-RED-003  No magic strings in comparisons
//	CODE-RED-004  Max 15 lines per function
//	CODE-RED-005  No fmt.Errorf() in Go (use apperror)
//	CODE-RED-006  No (T, error) returns in Go services (use Result[T])
//	CODE-RED-007  No string-based Go enums (use byte + iota)
//	CODE-RED-008  No raw string error codes — use apperrtype enum
//	CODE-RED-009  Generic file-not-found without exact path or reason
//	CODE-RED-011  No magic numbers in logic
//	CODE-RED-012  Immutable by default (const over let/var, no reassignment)
//	CODE-RED-013  File length ≤ 300 lines (hard max 400)
//	CODE-RED-014  Max 3 parameters per function
//	CODE-RED-015  No any/interface{}/unknown in business logic
//	CODE-RED-016  No silent error swallowing (empty catch, ignored err)
//	CODE-RED-017  PHP: catch Throwable, not Exception
//	CODE-RED-018  Sequential independent async (use Promise.all)
//	CODE-RED-019  SQL string concatenation (injection risk)
//	CODE-RED-020  Go: missing stack trace (raw errors.New instead of apperror)
//	CODE-RED-021  Mixed && and || in single expression
//	STYLE-001     Blank line before return
//	STYLE-002     No else after return
//	STYLE-003     Blank line after closing brace
//	STYLE-004     Blank line before if/else if block
//	STYLE-005     File length 300-400 lines (warning)
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

type Violation struct {
	File        string `json:"file"`
	Line        int    `json:"line"`
	Rule        string `json:"rule"`
	Severity    string `json:"severity"`
	Message     string `json:"message"`
	CodeSnippet string `json:"code_snippet,omitempty"`
}

type ValidationReport struct {
	TotalFiles      int            `json:"totalFiles"`
	TotalViolations int            `json:"totalViolations"`
	CodeRedCount    int            `json:"codeRedCount"`
	StyleCount      int            `json:"styleCount"`
	ByRule          map[string]int `json:"byRule"`
	Violations      []Violation    `json:"violations"`
	byFile          map[string]int
}

func newReport() *ValidationReport {
	return &ValidationReport{
		ByRule:     make(map[string]int),
		byFile:     make(map[string]int),
		Violations: []Violation{},
	}
}

func newViolation(file string, line int, rule, severity, msg, snippet string) Violation {
	return Violation{
		File: file, Line: line, Rule: rule,
		Severity: severity, Message: msg,
		CodeSnippet: truncate(snippet, 120),
	}
}

// ═══════════════════════════════════════════════════════════════════════
// Language Detection
// ═══════════════════════════════════════════════════════════════════════

var langExtMap = map[string]string{
	".go": "go", ".ts": "typescript", ".tsx": "typescript",
	".js": "javascript", ".jsx": "javascript",
	".php": "php", ".rs": "rust",
}

func detectLanguage(path string) string {
	return langExtMap[strings.ToLower(filepath.Ext(path))]
}

// ═══════════════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════════════

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}

	return s[:max]
}

func isComment(s string) bool {
	return strings.HasPrefix(s, "//") || strings.HasPrefix(s, "#") || strings.HasPrefix(s, "*")
}

var boolExempt = map[string]bool{
	"ok": true, "done": true, "found": true,
	"exists": true, "err": true, "error": true,
	"true": true, "false": true,
}

func isExemptBoolName(name string) bool {
	return boolExempt[strings.ToLower(name)]
}

var boolPrefixes = []string{"is", "has", "can", "should", "was", "will"}

func hasBoolPrefix(name string) bool {
	for _, p := range boolPrefixes {
		if strings.HasPrefix(name, p) && len(name) > len(p) && name[len(p)] >= 'A' && name[len(p)] <= 'Z' {
			return true
		}
	}

	return false
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-001: No nested if
// ═══════════════════════════════════════════════════════════════════════

func lineIndent(line string) int {
	return len(line) - len(strings.TrimLeft(line, " \t"))
}

func isIfStatement(stripped string) bool {
	return strings.HasPrefix(stripped, "if ") || strings.HasPrefix(stripped, "if(")
}

func checkNestedIf(lines []string, path string) []Violation {
	var violations []Violation
	type stackEntry struct {
		indent int
		line   int
	}
	var stack []stackEntry

	for i, line := range lines {
		stripped := strings.TrimSpace(line)

		if isIfStatement(stripped) {
			violations = append(violations, detectNesting(stack, line, stripped, path, i+1)...)
			stack = append(stack, stackEntry{lineIndent(line), i})
		}

		if stripped == "}" && len(stack) > 0 {
			stack = pruneStack(stack, lineIndent(line))
		}
	}

	return violations
}

func detectNesting(stack []struct{ indent, line int }, line, stripped, path string, lineNum int) []Violation {
	indent := lineIndent(line)
	for _, parent := range stack {
		if indent > parent.indent {
			v := newViolation(path, lineNum, "CODE-RED-001", "CODE-RED",
				"Nested `if` is forbidden. Flatten with early returns or combined conditions.", stripped)

			return []Violation{v}
		}
	}

	return nil
}

func pruneStack(stack []struct{ indent, line int }, braceIndent int) []struct{ indent, line int } {
	var result []struct{ indent, line int }
	for _, e := range stack {
		if e.indent < braceIndent {
			result = append(result, e)
		}
	}

	return result
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-002: Boolean naming
// ═══════════════════════════════════════════════════════════════════════

var (
	goBoolPattern  = regexp.MustCompile(`(\w+)\s*:=\s*(true|false)\b`)
	phpBoolPattern = regexp.MustCompile(`\$(\w+)\s*=\s*(?i)(true|false)\b`)
	tsBoolPattern  = regexp.MustCompile(`(?:const|let|var)\s+(\w+)\s*(?::\s*boolean)?\s*=\s*(true|false)\b`)
)

func boolPatternForLang(lang string) *regexp.Regexp {
	switch lang {
	case "go":
		return goBoolPattern
	case "php":
		return phpBoolPattern
	case "typescript", "javascript":
		return tsBoolPattern
	default:
		return nil
	}
}

func checkBooleanNaming(lines []string, path string, lang string) []Violation {
	pattern := boolPatternForLang(lang)
	if pattern == nil {
		return nil
	}

	var violations []Violation
	for i, line := range lines {
		violations = append(violations, checkBoolLine(pattern, line, path, i+1)...)
	}

	return violations
}

func checkBoolLine(pattern *regexp.Regexp, line, path string, lineNum int) []Violation {
	var violations []Violation
	for _, m := range pattern.FindAllStringSubmatch(line, -1) {
		name := m[1]
		if isExemptBoolName(name) || strings.HasPrefix(name, "_") || hasBoolPrefix(name) {
			continue
		}

		violations = append(violations, newViolation(path, lineNum, "CODE-RED-002", "CODE-RED",
			fmt.Sprintf(`Boolean variable "%s" must start with is/has/can/should/was/will.`, name),
			strings.TrimSpace(line)))
	}

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-003: No magic strings
// ═══════════════════════════════════════════════════════════════════════

var (
	goMagicPattern  = regexp.MustCompile(`(?:==|!=)\s*"([^"]+)"`)
	phpMagicPattern = regexp.MustCompile(`(?:===|!==|==|!=)\s*['"]([^'"]+)['"]`)
	tsMagicPattern  = regexp.MustCompile(`(?:===|!==)\s*['"]([^'"]+)['"]`)
)

var magicStringExempt = map[string]bool{
	"": true, "GET": true, "POST": true, "PUT": true, "DELETE": true, "PATCH": true,
	"string": true, "number": true, "boolean": true, "undefined": true,
	"object": true, "function": true, "utf-8": true, "utf8": true,
	"horizontal": true, "vertical": true, "left": true, "right": true,
	"top": true, "bottom": true, "sm": true, "md": true, "lg": true, "xl": true, "2xl": true,
	"none": true, "auto": true, "popper": true, "dot": true, "line": true, "dashed": true,
	"collapsed": true, "expanded": true, "floating": true, "inset": true,
	"sidebar": true, "header": true, "footer": true,
	"default": true, "destructive": true, "outline": true, "secondary": true, "ghost": true, "link": true,
}

func magicStringPattern(lang string) *regexp.Regexp {
	switch lang {
	case "go":
		return goMagicPattern
	case "php":
		return phpMagicPattern
	case "typescript", "javascript":
		return tsMagicPattern
	default:
		return nil
	}
}

func isMagicStringExempt(value string) bool {
	if magicStringExempt[value] || len(value) <= 1 {
		return true
	}

	return strings.HasPrefix(value, "/") || strings.HasPrefix(value, "http") || strings.HasPrefix(value, ".")
}

func checkMagicStrings(lines []string, path string, lang string) []Violation {
	pattern := magicStringPattern(lang)
	if pattern == nil {
		return nil
	}

	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if isComment(stripped) {
			continue
		}

		violations = append(violations, scanMagicStringMatches(pattern, line, stripped, path, i+1)...)
	}

	return violations
}

func scanMagicStringMatches(pattern *regexp.Regexp, line, stripped, path string, lineNum int) []Violation {
	var violations []Violation
	for _, m := range pattern.FindAllStringSubmatch(line, -1) {
		if isMagicStringExempt(m[1]) {
			continue
		}

		violations = append(violations, newViolation(path, lineNum, "CODE-RED-003", "CODE-RED",
			fmt.Sprintf(`Magic string "%s" in comparison. Use an enum constant.`, m[1]), stripped))
	}

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-004: Function length
// ═══════════════════════════════════════════════════════════════════════

var (
	goFuncPattern  = regexp.MustCompile(`^func\s+(?:\(.*?\)\s+)?(\w+)`)
	phpFuncPattern = regexp.MustCompile(`(?:public|private|protected|static)?\s*function\s+(\w+)`)
	tsFuncPattern  = regexp.MustCompile(`(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)`)
)

func funcPatternForLang(lang string) *regexp.Regexp {
	switch lang {
	case "go":
		return goFuncPattern
	case "php":
		return phpFuncPattern
	case "typescript", "javascript":
		return tsFuncPattern
	default:
		return nil
	}
}

func extractFuncName(match []string) string {
	for _, g := range match[1:] {
		if g != "" {
			return g
		}
	}

	return "anonymous"
}

func findOpenBrace(lines []string, start int) int {
	for j := start; j < len(lines); j++ {
		if strings.Contains(lines[j], "{") {
			return j
		}
	}

	return -1
}

func countBodyLines(lines []string, braceLine int) int {
	depth := 0
	bodyLines := 0
	for j := braceLine; j < len(lines); j++ {
		depth += strings.Count(lines[j], "{") - strings.Count(lines[j], "}")

		if j > braceLine {
			stripped := strings.TrimSpace(lines[j])
			if stripped != "" && !isComment(stripped) && stripped != "}" {
				bodyLines++
			}
		}

		if depth <= 0 && j > braceLine {
			break
		}
	}

	return bodyLines
}

func checkFunctionLength(lines []string, path string, lang string, maxLines int) []Violation {
	pattern := funcPatternForLang(lang)
	if pattern == nil {
		return nil
	}

	var violations []Violation
	for i := 0; i < len(lines); i++ {
		m := pattern.FindStringSubmatch(lines[i])
		if m == nil {
			continue
		}

		violations = append(violations, checkSingleFunc(lines, path, m, i, maxLines)...)
	}

	return violations
}

func checkSingleFunc(lines []string, path string, match []string, startLine, maxLines int) []Violation {
	funcName := extractFuncName(match)
	braceLine := findOpenBrace(lines, startLine)
	if braceLine < 0 {
		return nil
	}

	bodyLines := countBodyLines(lines, braceLine)
	if bodyLines <= maxLines {
		return nil
	}

	return []Violation{newViolation(path, startLine+1, "CODE-RED-004", "CODE-RED",
		fmt.Sprintf(`Function "%s" has %d lines (max %d). Extract into smaller helpers.`, funcName, bodyLines, maxLines),
		strings.TrimSpace(lines[startLine]))}
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-005/006/007/008: Go-specific rules
// ═══════════════════════════════════════════════════════════════════════

var (
	goStringEnumPattern   = regexp.MustCompile(`^type\s+\w+\s+string\s*$`)
	goTupleReturnPattern  = regexp.MustCompile(`func\s.*\)\s*\(\*?\w+,\s*error\)`)
	goRawErrorCodePattern = regexp.MustCompile(`apperror\.(New|Wrap|Fail\w*)\(\s*"E\d+`)
)

func checkGoLineRules(stripped, path string, lineNum int) []Violation {
	var violations []Violation

	if strings.Contains(stripped, "fmt.Errorf(") && !strings.HasPrefix(stripped, "//") {
		violations = append(violations, newViolation(path, lineNum, "CODE-RED-005", "CODE-RED",
			"Use apperror.New()/apperror.Wrap() instead of fmt.Errorf().", stripped))
	}

	if goStringEnumPattern.MatchString(stripped) {
		violations = append(violations, newViolation(path, lineNum, "CODE-RED-007", "CODE-RED",
			"String-based enums forbidden. Use `type Variant byte` with iota.", stripped))
	}

	if goRawErrorCodePattern.MatchString(stripped) && !strings.HasPrefix(stripped, "//") {
		violations = append(violations, newViolation(path, lineNum, "CODE-RED-008", "CODE-RED",
			`Raw string error code (e.g. "E2010") found. Use apperrtype enum.`, stripped))
	}

	return violations
}

func checkGoTupleReturns(lines []string, path string) []Violation {
	lowerPath := strings.ToLower(path)
	if strings.Contains(lowerPath, "test") || strings.HasSuffix(lowerPath, "_test.go") {
		return nil
	}

	var violations []Violation
	for i, line := range lines {
		if goTupleReturnPattern.MatchString(line) {
			violations = append(violations, newViolation(path, i+1, "CODE-RED-006", "CODE-RED",
				"Service functions must return Result[T], not (T, error).", strings.TrimSpace(line)))
		}
	}

	return violations
}

func checkGoSpecific(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		violations = append(violations, checkGoLineRules(strings.TrimSpace(line), path, i+1)...)
	}

	violations = append(violations, checkGoTupleReturns(lines, path)...)

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-011: No magic numbers
// ═══════════════════════════════════════════════════════════════════════

var (
	magicNumberPattern    = regexp.MustCompile(`(?:==|!=|===|!==|>=|<=|[><]|\*|/|%)\s*(-?\d+\.?\d*)`)
	bracketIndexPattern   = regexp.MustCompile(`\[\s*\d+\s*\]`)
	tailwindNumberPattern = regexp.MustCompile(`[a-z]-\d|/\d|opacity-|z-\d|gap-|p-|m-|w-|h-|text-\d|rounded-`)
	stringContextPattern  = regexp.MustCompile(`className=|class=|["'` + "`" + `].*[-/]\d`)
	jsxTextNumberPattern  = regexp.MustCompile(`>\s*\d+\s*</`)
)

var magicNumberExempt = map[string]bool{
	"0": true, "1": true, "-1": true, "0.0": true, "1.0": true, "100": true, "2": true,
}

func shouldSkipMagicNumberLine(stripped string) bool {
	if isComment(stripped) {
		return true
	}

	if strings.HasPrefix(stripped, "import") || strings.HasPrefix(stripped, "require") {
		return true
	}

	if strings.HasPrefix(stripped, "const ") || strings.HasPrefix(stripped, "const(") {
		return true
	}

	return strings.Contains(stripped, "= iota")
}

func isUIContextLine(stripped string) bool {
	return tailwindNumberPattern.MatchString(stripped) ||
		stringContextPattern.MatchString(stripped) ||
		jsxTextNumberPattern.MatchString(stripped)
}

func checkMagicNumbers(lines []string, path string, lang string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if shouldSkipMagicNumberLine(stripped) || isUIContextLine(stripped) {
			continue
		}

		violations = append(violations, scanMagicNumberMatches(line, stripped, path, i+1)...)
	}

	return violations
}

func scanMagicNumberMatches(line, stripped, path string, lineNum int) []Violation {
	cleaned := bracketIndexPattern.ReplaceAllString(line, "[]")
	var violations []Violation
	for _, m := range magicNumberPattern.FindAllStringSubmatch(cleaned, -1) {
		value := m[1]
		if magicNumberExempt[value] || value == "" {
			continue
		}

		lower := strings.ToLower(stripped)
		if strings.Contains(lower, "line") || strings.Contains(lower, "column") {
			continue
		}

		violations = append(violations, newViolation(path, lineNum, "CODE-RED-011", "CODE-RED",
			fmt.Sprintf("Magic number %s in logic. Use a named constant.", value), stripped))
	}

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// CODE-RED-012: Variable mutation
// ═══════════════════════════════════════════════════════════════════════

var (
	tsLetVarPattern   = regexp.MustCompile(`^\s*(?:let|var)\s+(\w+)\s*(?::\s*\w+)?\s*=`)
	goDeclPattern     = regexp.MustCompile(`^\s+(\w+)\s*:=\s+`)
	goReassignPattern = regexp.MustCompile(`^\s+(\w+)\s*=\s+`)
)

var tsLoopVarExempt = map[string]bool{
	"i": true, "j": true, "k": true, "idx": true, "index": true,
}

var goMutationExempt = map[string]bool{
	"err": true, "ok": true, "ctx": true, "cancel": true, "mu": true, "wg": true,
}

func checkTSMutation(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if isComment(stripped) || strings.HasPrefix(stripped, "/*") {
			continue
		}

		v := checkTSLine(line, stripped, path, i+1)
		if v != nil {
			violations = append(violations, *v)
		}
	}

	return violations
}

func checkTSLine(line, stripped, path string, lineNum int) *Violation {
	m := tsLetVarPattern.FindStringSubmatch(line)
	if m == nil {
		return nil
	}

	name := m[1]
	if tsLoopVarExempt[name] || strings.Contains(line, "useState") || strings.Contains(line, "useRef") {
		return nil
	}

	if strings.HasPrefix(stripped, "for ") || strings.HasPrefix(stripped, "for(") {
		return nil
	}

	v := newViolation(path, lineNum, "CODE-RED-012", "CODE-RED",
		fmt.Sprintf(`Use "const" instead of "let"/"var" for "%s". Assign once.`, name), stripped)

	return &v
}

func checkGoMutation(lines []string, path string) []Violation {
	declared := make(map[string]int)
	var violations []Violation

	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if strings.HasPrefix(stripped, "//") {
			continue
		}

		if dm := goDeclPattern.FindStringSubmatch(line); dm != nil {
			declared[dm[1]] = i + 1
		}

		violations = append(violations, checkGoReassign(line, stripped, path, i+1, declared)...)
	}

	return violations
}

func checkGoReassign(line, stripped, path string, lineNum int, declared map[string]int) []Violation {
	rm := goReassignPattern.FindStringSubmatch(line)
	if rm == nil {
		return nil
	}

	name := rm[1]
	declLine, wasDeclared := declared[name]
	if !wasDeclared || lineNum-declLine <= 1 || goMutationExempt[name] || strings.HasPrefix(name, "_") {
		return nil
	}

	return []Violation{newViolation(path, lineNum, "CODE-RED-012", "CODE-RED",
		fmt.Sprintf(`Variable "%s" reassigned (first declared L%d). Avoid mutation.`, name, declLine), stripped)}
}

func checkVariableMutation(lines []string, path string, lang string) []Violation {
	if lang == "typescript" || lang == "javascript" {
		return checkTSMutation(lines, path)
	}

	if lang == "go" {
		return checkGoMutation(lines, path)
	}

	return nil
}

// ═══════════════════════════════════════════════════════════════════════
// Style Checks
// ═══════════════════════════════════════════════════════════════════════

func checkStyleBlankBeforeReturn(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if !strings.HasPrefix(stripped, "return ") && stripped != "return" {
			continue
		}

		if i > 0 {
			prev := strings.TrimSpace(lines[i-1])
			if prev != "" && prev != "{" && !strings.HasPrefix(prev, "//") {
				violations = append(violations, newViolation(path, i+1, "STYLE-001", "STYLE",
					"Add a blank line before `return` statement.", stripped))
			}
		}
	}

	return violations
}

func checkStyleNoElseAfterReturn(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if !strings.HasPrefix(stripped, "} else") {
			continue
		}

		if hasReturnInPrecedingBlock(lines, i) {
			violations = append(violations, newViolation(path, i+1, "STYLE-002", "STYLE",
				"No `else` after `return`. Use early return pattern.", stripped))
		}
	}

	return violations
}

func hasReturnInPrecedingBlock(lines []string, i int) bool {
	for j := i - 1; j >= 0 && j >= i-5; j-- {
		ps := strings.TrimSpace(lines[j])
		if strings.HasPrefix(ps, "return ") || ps == "return" {
			return true
		}

		if ps == "}" || ps == "{" {
			return false
		}
	}

	return false
}

func checkStyleBlankAfterBrace(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if stripped != "}" || i+1 >= len(lines) {
			continue
		}

		next := strings.TrimSpace(lines[i+1])
		if isNonBraceCode(next) {
			violations = append(violations, newViolation(path, i+1, "STYLE-003", "STYLE",
				"Add a blank line after closing `}`.", stripped))
		}
	}

	return violations
}

func isNonBraceCode(next string) bool {
	if next == "" || next == "}" || next == ")" {
		return false
	}

	if strings.HasPrefix(next, "//") || strings.HasPrefix(next, "} else") {
		return false
	}

	return !strings.HasPrefix(next, "case ") && next != "default:"
}

func checkStyleBlankBeforeIf(lines []string, path string) []Violation {
	var violations []Violation
	for i, line := range lines {
		stripped := strings.TrimSpace(line)
		if !isIfStatement(stripped) || i == 0 {
			continue
		}

		prev := strings.TrimSpace(lines[i-1])
		if prev != "" && prev != "{" && prev != "}" && !isComment(prev) {
			violations = append(violations, newViolation(path, i+1, "STYLE-004", "STYLE",
				"Add a blank line before `if` block.", stripped))
		}
	}

	return violations
}

func checkStyleRules(lines []string, path string) []Violation {
	var violations []Violation
	violations = append(violations, checkStyleBlankBeforeReturn(lines, path)...)
	violations = append(violations, checkStyleNoElseAfterReturn(lines, path)...)
	violations = append(violations, checkStyleBlankAfterBrace(lines, path)...)
	violations = append(violations, checkStyleBlankBeforeIf(lines, path)...)

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// File Validation
// ═══════════════════════════════════════════════════════════════════════

var skipPatterns = []string{
	"vendor/", "node_modules/", "dist/", ".min.", "_test.go",
	"components/ui/", // Auto-generated shadcn/ui — not business logic
}

func shouldSkip(path string) bool {
	// NOTE: _test.go is also excluded in .golangci.yml exclude-rules.
	// Both tools skip independently — this is intentional, not a bug.
	normalized := strings.ReplaceAll(path, "\\", "/")
	for _, p := range skipPatterns {
		if strings.Contains(normalized, p) {
			return true
		}
	}

	base := filepath.Base(path)

	return strings.HasSuffix(base, ".test.ts") || strings.HasSuffix(base, ".spec.ts")
}

func validateFile(path string, maxLines int) []Violation {
	lang := detectLanguage(path)
	if lang == "" || shouldSkip(path) {
		return nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}

	lines := strings.Split(string(data), "\n")

	return runAllChecks(lines, path, lang, maxLines)
}

func runAllChecks(lines []string, path, lang string, maxLines int) []Violation {
	var violations []Violation
	// Universal rules
	violations = append(violations, checkNestedIf(lines, path)...)
	violations = append(violations, checkBooleanNaming(lines, path, lang)...)
	violations = append(violations, checkMagicStrings(lines, path, lang)...)
	violations = append(violations, checkMagicNumbers(lines, path, lang)...)
	violations = append(violations, checkFunctionLength(lines, path, lang, maxLines)...)
	violations = append(violations, checkVariableMutation(lines, path, lang)...)
	violations = append(violations, checkStyleRules(lines, path)...)
	violations = append(violations, checkFileLength(lines, path)...)
	violations = append(violations, checkParameterCount(lines, path, lang)...)
	violations = append(violations, checkNoAnyType(lines, path, lang)...)
	violations = append(violations, checkErrorSwallowing(lines, path, lang)...)
	violations = append(violations, checkGenericFileErrors(lines, path)...)
	violations = append(violations, checkSequentialAsync(lines, path, lang)...)
	violations = append(violations, checkSQLInjection(lines, path, lang)...)
	violations = append(violations, checkMixedOperators(lines, path)...)

	// Language-specific
	if lang == "go" {
		violations = append(violations, checkGoSpecific(lines, path)...)
		violations = append(violations, checkGoRawErrors(lines, path)...)
	}

	if lang == "php" {
		violations = append(violations, checkPHPThrowable(lines, path)...)
	}

	return violations
}

// ═══════════════════════════════════════════════════════════════════════
// Report Output
// ═══════════════════════════════════════════════════════════════════════

const reportSep = "========================================================================"

func printReportHeader(report *ValidationReport) {
	fmt.Println(reportSep)
	fmt.Println("  CODING GUIDELINES VALIDATION REPORT")
	fmt.Println(reportSep)
	fmt.Printf("  Files scanned:      %d\n", report.TotalFiles)
	fmt.Printf("  Total violations:   %d\n", report.TotalViolations)
	fmt.Printf("  🔴 CODE RED:        %d\n", report.CodeRedCount)
	fmt.Printf("  ⚠️  Style:           %d\n", report.StyleCount)
	fmt.Println(reportSep)
}

func printViolationsByFile(violations []Violation) {
	byFile := groupByFile(violations)
	files := sortedKeys(byFile)

	for _, f := range files {
		vs := byFile[f]
		sort.Slice(vs, func(i, j int) bool { return vs[i].Line < vs[j].Line })
		fmt.Printf("\n📄 %s (%d violations)\n", f, len(vs))
		printFileViolations(vs)
	}
}

func groupByFile(violations []Violation) map[string][]Violation {
	byFile := make(map[string][]Violation)
	for _, v := range violations {
		byFile[v.File] = append(byFile[v.File], v)
	}

	return byFile
}

func sortedKeys(m map[string][]Violation) []string {
	var keys []string
	for k := range m {
		keys = append(keys, k)
	}

	sort.Strings(keys)

	return keys
}

func printFileViolations(vs []Violation) {
	for _, v := range vs {
		icon := "🔴"
		if v.Severity != "CODE-RED" {
			icon = "⚠️ "
		}

		fmt.Printf("  %s L%-5d [%s] %s\n", icon, v.Line, v.Rule, v.Message)
		if v.CodeSnippet != "" {
			fmt.Printf("           │ %d: %s\n", v.Line, v.CodeSnippet)
		}
	}
}

func printRuleSummary(byRule map[string]int) {
	fmt.Printf("\n%s\n", reportSep)
	fmt.Println("  BY RULE:")

	var rules []string
	for r := range byRule {
		rules = append(rules, r)
	}

	sort.Strings(rules)
	for _, r := range rules {
		fmt.Printf("    %s: %d\n", r, byRule[r])
	}

	fmt.Printf("%s\n\n", reportSep)
}

func printReportFooter(report *ValidationReport) {
	if report.CodeRedCount > 0 {
		fmt.Printf("  ❌ FAILED — %d CODE RED violation(s) must be fixed before merge.\n\n", report.CodeRedCount)
	} else {
		fmt.Printf("  ⚠️  PASSED with %d style warning(s).\n\n", report.StyleCount)
	}
}

func printReport(report *ValidationReport) {
	printReportHeader(report)

	if len(report.Violations) == 0 {
		fmt.Println("\n  ✅ ALL CLEAR — No violations found.\n")

		return
	}

	printViolationsByFile(report.Violations)
	printRuleSummary(report.ByRule)
	printReportFooter(report)
}

// ═══════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════

var validExtensions = map[string]bool{
	".go": true, ".ts": true, ".tsx": true,
	".js": true, ".jsx": true, ".php": true, ".rs": true,
}

func parseFlags() (string, bool, int) {
	scanPath := flag.String("path", "src", "Directory to scan (default: src)")
	outputJSON := flag.Bool("json", false, "Output as JSON")
	maxLines := flag.Int("max-lines", 15, "Max function lines (default: 15)")
	flag.Parse()

	return *scanPath, *outputJSON, *maxLines
}

func addViolations(report *ValidationReport, violations []Violation) {
	for _, v := range violations {
		report.Violations = append(report.Violations, v)
		report.TotalViolations++
		report.ByRule[v.Rule]++
		report.byFile[v.File]++

		if v.Severity == "CODE-RED" {
			report.CodeRedCount++
		} else {
			report.StyleCount++
		}
	}
}

func walkAndValidate(scanPath string, maxLines int, report *ValidationReport) error {
	return filepath.Walk(scanPath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !validExtensions[ext] {
			return nil
		}

		report.TotalFiles++
		addViolations(report, validateFile(path, maxLines))

		return nil
	})
}

func outputReport(report *ValidationReport, asJSON bool) {
	if asJSON {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		enc.Encode(report)
	} else {
		printReport(report)
	}
}

func main() {
	scanPath, outputJSON, maxLines := parseFlags()
	report := newReport()

	if err := walkAndValidate(scanPath, maxLines, report); err != nil {
		fmt.Fprintf(os.Stderr, "Error walking path: %v\n", err)
		os.Exit(2)
	}

	outputReport(report, outputJSON)

	if report.CodeRedCount > 0 {
		os.Exit(1)
	}
}
