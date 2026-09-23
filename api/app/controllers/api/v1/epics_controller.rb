# frozen_string_literal: true

module Api
  module V1
    class EpicsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_workspace, only: %i[index create]
      before_action :authorize_workspace, only: %i[index create]
      before_action :set_epic, only: %i[show update destroy]
      before_action :authorize_epic, only: %i[show update destroy]

      def index
        render json: { epics: policy_scope(@workspace.epics) }, status: :ok
      end

      def show
        render json: { epic: epic_attributes(@epic) }, status: :ok
      end

      def create
        epic = @workspace.epics.new(epic_params)

        if epic.save
          render json: { epic: epic_attributes(epic) }, status: :created
        else
          render json: { errors: epic.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @epic.update(epic_params)
          render json: { epic: epic_attributes(@epic) }, status: :ok
        else
          render json: { errors: @epic.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @epic.destroy!
        head :no_content
      end

      private

      def set_workspace
        @workspace = Workspace.find(params[:workspace_id])
      end

      def authorize_workspace
        authorize @workspace, :show?
      end

      def set_epic
        @epic = Epic.find(params[:id])
      end

      def authorize_epic
        authorize @epic
      end

      def epic_params
        params.require(:epic).permit(:name, :description)
      end

      def epic_attributes(epic)
        { id: epic.id, workspace_id: epic.workspace_id, name: epic.name, description: epic.description }
      end
    end
  end
end
