# frozen_string_literal: true

module Api
  module V1
    class SprintsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_workspace, only: %i[index create]
      before_action :authorize_workspace, only: %i[index create]
      before_action :set_sprint, only: %i[show update destroy]
      before_action :authorize_sprint, only: %i[show update destroy]

      def index
        render json: { sprints: policy_scope(@workspace.sprints) }, status: :ok
      end

      def show
        render json: { sprint: sprint_attributes(@sprint) }, status: :ok
      end

      def create
        sprint = @workspace.sprints.new(sprint_params)
        if sprint.save
          render json: { sprint: sprint_attributes(sprint) }, status: :created
        else
          render json: { errors: sprint.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @sprint.update(sprint_params)
          render json: { sprint: sprint_attributes(@sprint) }, status: :ok
        else
          render json: { errors: @sprint.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @sprint.destroy!
        head :no_content
      end

      private

      def set_workspace
        @workspace = Workspace.find(params[:workspace_id])
      end

      def authorize_workspace
        authorize @workspace, :show?
      end

      def set_sprint
        @sprint = Sprint.find(params[:id])
      end

      def authorize_sprint
        authorize @sprint
      end

      def sprint_params
        params.require(:sprint).permit(:name, :status)
      end

      def sprint_attributes(sprint)
        { id: sprint.id, workspace_id: sprint.workspace_id, name: sprint.name, status: sprint.status }
      end
    end
  end
end
