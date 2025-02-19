import { Contract, ethers } from "ethers";

export const fetchFromContract = async <T>(
  contract: Contract,
  method: string,
  ...args: any[]
): Promise<T> => {
  try {
    const data = await contract[method](...args);
    return data as T;
  } catch (error) {
    console.error(`Помилка виклику ${method}:`, error);
    throw error;
  }
};
