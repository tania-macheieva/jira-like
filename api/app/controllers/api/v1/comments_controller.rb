# frozen_string_literal: true

module Api
  module V1
    class CommentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_issue, only: %i[index create]
      before_action :authorize_issue, only: %i[index create]
      before_action :set_comment, only: %i[update destroy]
      before_action :authorize_comment, only: %i[update destroy]

      def index
        comments = policy_scope(@issue.comments).includes(:user)
        render json: { comments: comments.map { |comment| comment_attributes(comment) } }, status: :ok
      end

      def create
        comment = @issue.comments.new(comment_params.merge(user: current_user))

        if comment.save
          render json: { comment: comment_attributes(comment) }, status: :created
        else
          render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @comment.update(comment_params)
          render json: { comment: comment_attributes(@comment) }, status: :ok
        else
          render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @comment.destroy!
        head :no_content
      end

      private

      def set_issue
        @issue = Issue.find(params[:issue_id])
      end

      def authorize_issue
        authorize @issue, :show?
      end

      def set_comment
        @comment = Comment.find(params[:id])
      end

      def authorize_comment
        authorize @comment
      end

      def comment_params
        params.require(:comment).permit(:body)
      end

      def comment_attributes(comment)
        {
          id: comment.id,
          issue_id: comment.issue_id,
          user_id: comment.user_id,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            email: comment.user.email
          },
          body: comment.body,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
      end
    end
  end
end
