# frozen_string_literal: true

require_relative 'concerns/authentication'

class ApplicationController < ActionController::Base
  include Authentication

  protect_from_forgery with: :null_session
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? || request.path.start_with?('/api/') }

  allow_browser versions: :modern

  stale_when_importmap_changes
end
