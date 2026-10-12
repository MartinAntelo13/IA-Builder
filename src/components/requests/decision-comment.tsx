interface DecisionCommentProps {
  comment: string;
  decidedByName: string;
}

export function DecisionComment({ comment, decidedByName }: DecisionCommentProps) {
  return (
    <div className="p-3 bg-danger-bg rounded-md">
      <p className="m-0 text-2xs font-medium text-danger">{decidedByName}</p>
      <p className="m-0 mt-1 text-2xs text-muted whitespace-pre-wrap break-words">{comment}</p>
    </div>
  );
}
