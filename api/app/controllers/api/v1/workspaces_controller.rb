# frozen_string_literal: true

module Api
  module V1
    class WorkspacesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_workspace, only: %i[show update destroy]
      before_action :authorize_workspace, only: %i[show update destroy]

      def index
        render json: { workspaces: policy_scope(Workspace) }, status: :ok
      end

      def show
        render json: { workspace: workspace_attributes(@workspace) }, status: :ok
      end

      def create
        workspace = nil

        Workspace.transaction do
          workspace = Workspace.create!(workspace_params)
          workspace.workspace_memberships.create!(user: current_user, role: :owner)
        end

        render json: { workspace: workspace_attributes(workspace) }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def update
        if @workspace.update(workspace_params)
          render json: { workspace: workspace_attributes(@workspace) }, status: :ok
        else
          render json: { errors: @workspace.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @workspace.destroy!
        head :no_content
      end

      private

      def set_workspace
        @workspace = Workspace.find(params[:id])
      end

      def authorize_workspace
        authorize @workspace
      end

      def workspace_params
        params.require(:workspace).permit(:name, :key)
      end

      def workspace_attributes(workspace)
        { id: workspace.id, name: workspace.name, key: workspace.key }
      end
    end
  end
end
