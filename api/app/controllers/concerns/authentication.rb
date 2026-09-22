# frozen_string_literal: true

module Authentication
  extend ActiveSupport::Concern

  included do
    helper_method :current_user
  end

  private

  def authenticate_user!
    return if current_user

    render json: { error: 'Authentication required' }, status: :unauthorized
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end
end
