import * as ts from "typescript";

const MODULE_NAME = "hoistr";

interface HoistedExpression {
  readonly expr: ts.Expression;
  readonly name: string;
}

export default function hoistrTransformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile) => {
      let hoistrImportModuleStmt: ts.Statement | undefined;
      let lastImportDeclarationIndex = 0;
      sourceFile.statements.forEach((stmt, index) => {
        if (ts.isImportDeclaration(stmt)) {
          lastImportDeclarationIndex = index;
          if (ts.isStringLiteral(stmt.moduleSpecifier) && stmt.moduleSpecifier.text === MODULE_NAME) {
            hoistrImportModuleStmt = stmt;
          }
        }
      });

      if (hoistrImportModuleStmt === void 0) {
        return sourceFile;
      }

      const hoisted: HoistedExpression[] = [];

      const hoistExpressions = (node: ts.Node): ts.Node => {
        if (ts.isCallExpression(node)) {
          if (node.expression.getText() === "hoist") {
            const expr = node.arguments[0];
            const name = `___hoisted_${hoisted.length + 1}`;
            hoisted.push({ expr, name });
            return ts.createIdentifier(name);
          }
        }

        return ts.visitEachChild(node, hoistExpressions, context);
      };

      const next = ts.visitNode(sourceFile, (node) => ts.visitEachChild(node, hoistExpressions, context));

      return ts.updateSourceFileNode(sourceFile, [
        ...next.statements.slice(0, lastImportDeclarationIndex + 1).filter((v) => v !== hoistrImportModuleStmt),
        ...hoisted.map((v) => (
          ts.createVariableStatement(
            void 0,
            ts.createVariableDeclarationList([
              ts.setSourceMapRange(
                ts.createVariableDeclaration(v.name, void 0, v.expr),
                ts.getSourceMapRange(v.expr),
              )],
              ts.NodeFlags.Const,
            )
          )
        )),
        ...next.statements.slice(lastImportDeclarationIndex + 1),
      ]);
    };
  };
}
