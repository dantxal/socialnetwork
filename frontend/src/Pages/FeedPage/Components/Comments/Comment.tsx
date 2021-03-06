import React, { Suspense, useState } from 'react';
import { useFragment } from 'react-relay/hooks';
import { useMutation } from 'react-relay/lib/relay-experimental';
import graphql from 'babel-plugin-relay/macro';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-regular-svg-icons'

import { Replies, ReplyCreation } from '../';

const commentEdgeFragment = graphql`
fragment CommentTypeFragment on CommentTypeEdge {
    cursor
    node {
        id
        author {
            name
        }
        content
        likes
        userHasLiked
        createdAt
        updatedAt
        ...RepliesTypeFragment
    }
    
}`;

const commentReplyCreationMutation = graphql`
    mutation CommentReplyCreationMutation ($content: String!, $comment: String!) {
        CreateReply (input: {content: $content, comment: $comment, clientMutationId: "3"}) {
            reply {
                content,
                author {
                    name
                }
            }
        }
    }
`;

const commentLikeMutation = graphql `
    mutation CommentLikeMutation($commentId: String!) {
        LikeComment (input: {comment: $commentId, clientMutationId: "6"}) {
            comment {
                likes
                userHasLiked
            }
        }
    }
`;

const Comment = ({comment}: any) => {
    const commentEdge = useFragment(commentEdgeFragment, comment);
    const [likes, setLikes] = useState(commentEdge.node ? commentEdge.node.likes : 0);
    const [hasLiked, setHasLiked] = useState(commentEdge.node ? commentEdge.node.userHasLiked : false);

    const [showReplyCreation, setShowReplyCreation] = useState(false);

    const [commitReplyCre, replyCreIsInFlight] = useMutation(commentReplyCreationMutation);
    const [commitLikeMut, likeMutIsInFlight] = useMutation(commentLikeMutation);

    let replyContent = '';

    const replyCreationFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        repliesHandler();
        const variables = {
            content: replyContent,
            comment: commentEdge.node ? commentEdge.node.id : null
        }
        if (variables.comment && variables.content) {
            commitReplyCre({
                variables,
                onCompleted: (data: any) => {
                }
            })
        }
    };

    const likeHandler = () => {
        setLikes(hasLiked ? likes - 1 : likes + 1);
        setHasLiked(hasLiked ? false : true);
        const variables = {
            commentId: commentEdge.node ? commentEdge.node.id : null
        }
        if (variables.commentId) {
            commitLikeMut({
                variables,
                onCompleted: ({LikeComment}: any) => {
                    setLikes(LikeComment.comment.likes);
                    setHasLiked(LikeComment.comment.userHasLiked);
                }
            })
        }
    }

    const repliesHandler = () => {
        setShowReplyCreation(showReplyCreation ? false : true);
    }

    return (
        <div className="w-full">
            <div className="my-2">
                <small>
                    <b>
                        {commentEdge.node.author.name}
                    </b>
                </small>
                <div>
                    <p className="text-gray-800 text-base">
                        {commentEdge.node ? commentEdge.node.content : null}
                    </p>
                </div>
                <div className="mb-2">
                    <span className="text-teal-600 mr-2">
                        <FontAwesomeIcon icon={faThumbsUp} /> {likeMutIsInFlight ? likes : commentEdge.node.likes}
                    </span>
                    <span className={"cursor-pointer text-gray-800 " + ((likeMutIsInFlight ? hasLiked : commentEdge.node.userHasLiked) ? 'text-teal-600' : '')} onClick={likeHandler}>
                        {
                            (likeMutIsInFlight ? hasLiked : commentEdge.node.userHasLiked) ?
                            <>Liked</> :
                            <>Like</>
                        }
                    </span>
                    <span className={"cursor-pointer text-gray-800 mx-2 " + (showReplyCreation ? 'text-teal-700' : '')} onClick={repliesHandler}>
                        {
                            showReplyCreation ?
                            <>Replying</> :
                            <>Reply</>
                        }
                    </span>
                </div>
            </div>
            <div className="px-6">
                {
                    showReplyCreation && commentEdge && commentEdge.node ?
                    <ReplyCreation formSubmit={replyCreationFormSubmit} replyContentChange={newContent => replyContent = newContent}/> :
                    null
                }
                <div className="mb-4">
                    <Suspense fallback="loading...">
                        {
                            commentEdge && commentEdge.node ?
                            <Replies replies={commentEdge.node}/> :
                            null
                        }
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Comment