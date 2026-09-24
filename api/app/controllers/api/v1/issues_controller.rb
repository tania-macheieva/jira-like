# frozen_string_literal: true

module Api
  module V1
    class IssuesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_workspace, only: %i[index create]
      before_action :authorize_workspace, only: %i[index create]
      before_action :set_issue, only: %i[show update destroy]
      before_action :authorize_issue, only: %i[show update destroy]

      def index
        issues = policy_scope(@workspace.issues)
        issues = apply_filters(issues)

        render json: { issues: issues }, status: :ok
      end

      def show
        render json: { issue: issue_attributes(@issue) }, status: :ok
      end

      def create
        issue = @workspace.issues.new(issue_params.merge(creator: current_user))

        if issue.save
          render json: { issue: issue_attributes(issue) }, status: :created
        else
          render json: { errors: issue.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        attributes = issue_params.to_h
        requested_status = attributes.delete('status')

        Issue.transaction do
          move_issue(requested_status) if status_change_requested?(requested_status)
          update_issue(attributes)
        end

        render json: { issue: issue_attributes(@issue) }, status: :ok
      rescue WorkflowEngine::InvalidTransitionError => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      rescue ActiveRecord::RecordInvalid
        render json: { errors: @issue.errors.full_messages }, status: :unprocessable_entity
      end

      def destroy
        @issue.destroy!
        head :no_content
      end

      private

      def set_workspace
        @workspace = Workspace.find(params[:workspace_id])
      end

      def authorize_workspace
        authorize @workspace, :show?
      end

      def set_issue
        @issue = Issue.find(params[:id])
      end

      def authorize_issue
        authorize @issue
      end

      def issue_params
        params.require(:issue).permit(:title, :description, :status, :issue_type, :epic_id, :assignee_id, :sprint_id)
      end

      def apply_filters(issues)
        filters = params.permit(:status, :issue_type, :assignee_id, :epic_id).to_h.compact_blank
        issues.where(filters)
      end

      def move_issue(status)
        MoveIssueService.new(issue: @issue, to_status: status).call
      end

      def status_change_requested?(status)
        status.present? && status != @issue.status
      end

      def update_issue(attributes)
        @issue.update!(attributes) if attributes.present?
      end

      def issue_attributes(issue)
        {
          id: issue.id,
          workspace_id: issue.workspace_id,
          epic_id: issue.epic_id,
          sprint_id: issue.sprint_id,
          creator_id: issue.creator_id,
          assignee_id: issue.assignee_id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          issue_type: issue.issue_type
        }
      end
    end
  end
end
